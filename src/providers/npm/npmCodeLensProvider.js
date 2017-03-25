/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as npm from 'npm';
import * as jsonParser from 'vscode-contrib-jsonc';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { npmVersionParser } from './npmVersionParser';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';

export class NpmCodeLensProvider extends AbstractCodeLensProvider {

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/package.json'
    }
  }

  getPackageDependencyKeys() {
    return appConfig.npmDependencyProperties;
  }

  provideCodeLenses(document, token) {
    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const collector = new PackageCodeLensList(document, appConfig);
    this.collectDependencies_(collector, jsonDoc.root, npmVersionParser);
    if (collector.collection.length === 0)
      return [];

    return collector.collection;
  }

  resolveCodeLens(codeLens, token) {
    if (codeLens instanceof PackageCodeLens)
      return this.evaluateCodeLens(codeLens);
  }

  evaluateCodeLens(codeLens) {
    if (codeLens.package.version === 'latest')
      return CommandFactory.makeLatestCommand(codeLens);

    if (codeLens.package.meta) {
      if (codeLens.package.meta.type === 'github')
        return CommandFactory.makeGithubCommand(codeLens);

      if (codeLens.package.meta.type === 'file')
        return CommandFactory.makeLinkCommand(codeLens);
    }

    const viewPackageName = codeLens.package.name + (
      (!codeLens.package.isValidSemver || codeLens.package.hasRangeSymbol) ?
        `@${codeLens.package.version}` :
        ''
    );

    return doNpmViewVersion(viewPackageName)
      .then(remoteVersion => {
        // check that a version was returned by npm view
        if (remoteVersion === '')
          return CommandFactory.makeErrorCommand(
            `'npm view ${viewPackageName} version' did not return any results`,
            codeLens
          );

        if (codeLens.package.isValidSemver)
          return CommandFactory.makeVersionCommand(
            codeLens.package.version,
            remoteVersion,
            codeLens
          );

        if (!remoteVersion)
          return CommandFactory.makeErrorCommand(
            `${viewPackageName} gave an invalid response`,
            codeLens
          );

        return CommandFactory.makeTagCommand(`${viewPackageName} = v${remoteVersion}`, codeLens);
      })
      .catch(error => {
        console.error(error);
        return CommandFactory.makeErrorCommand(
          "An error occurred retrieving this package.",
          codeLens
        );
      });
  }

}

function doNpmViewVersion(packageName) {
  return new Promise((resolve, reject) => {
    npm.load(loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }

      npm.view(packageName, 'version', (viewError, response) => {
        if (viewError) {
          reject(viewError);
          return;
        }

        // get the keys from the object returned
        let keys = Object.keys(response);

        // take the last and most recent version key
        let lastKey = keys.length > 0 ? keys[keys.length - 1] : '';

        resolve(lastKey);
      });
    });
  });
}
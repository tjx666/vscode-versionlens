/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as bower from 'bower';
import * as jsonParser from 'vscode-contrib-jsonc';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { bowerVersionParser } from './bowerVersionParser';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';

export class BowerCodeLensProvider extends AbstractCodeLensProvider {

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/bower.json'
    }
  }

  getPackageDependencyKeys() {
    return appConfig.bowerDependencyProperties;
  }

  provideCodeLenses(document, token) {
    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const collector = new PackageCodeLensList(document, appConfig);
    this.collectDependencies_(collector, jsonDoc.root, bowerVersionParser);
    if (collector.collection.length === 0)
      return [];

    return collector.collection
  }

  resolveCodeLens(codeLens, token) {
    if (codeLens instanceof PackageCodeLens)
      return this.evaluateCodeLens(codeLens);
  }

  evaluateCodeLens(codeLens) {
    if (codeLens.command && codeLens.command.command.includes('updateDependenciesCommand'))
      return codeLens;

    if (codeLens.package.version === 'latest')
      return CommandFactory.makeLatestCommand(codeLens);

    if (codeLens.package.meta) {
      if (codeLens.package.meta.type === 'github')
        return CommandFactory.makeGithubCommand(codeLens);

      if (codeLens.package.meta.type === 'file')
        return CommandFactory.makeLinkCommand(codeLens);
    }

    return new Promise(success => {
      bower.commands.info(codeLens.package.name)
        .on('end', info => {
          if (!info || !info.latest) {
            success(CommandFactory.makeErrorCommand("Invalid object returned from server", codeLens));
            return;
          }
          success(CommandFactory.makeVersionCommand(codeLens.package.version, info.latest.version, codeLens));
        })
        .on('error', err => {
          console.error(err);
          success(
            CommandFactory.makeErrorCommand(
              "An error occurred retrieving this package.",
              codeLens
            )
          );
        });
    });
  }

}
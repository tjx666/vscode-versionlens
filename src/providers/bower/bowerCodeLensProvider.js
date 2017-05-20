/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { PackageCodeLens } from '../../common/packageCodeLens';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';
import { extractDependencyNodes, parseDependencyNodes } from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';
import appSettings from '../../common/appSettings';
import { clearDecorations } from '../../editor/decorations';
import { bowerGetPackageInfo } from './bowerAPI';
import { bowerPackageParser } from './bowerPackageParser';

const bower = require('bower');
const jsonParser = require('vscode-contrib-jsonc');

export class BowerCodeLensProvider extends AbstractCodeLensProvider {

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/bower.json'
    }
  }

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false)
      return;

    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const dependencyNodes = extractDependencyNodes(
      jsonDoc.root,
      appConfig.bowerDependencyProperties
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appConfig,
      bowerPackageParser
    );

    appSettings.inProgress = true;
    return generateCodeLenses(packageCollection, document)
      .then(codelenses => {
        appSettings.inProgress = false;
        return codelenses;
      });
  }

  evaluateCodeLens(codeLens) {
    if (codeLens.command && codeLens.command.command.includes('updateDependenciesCommand'))
      return codeLens;

    if (codeLens.package.version === 'latest')
      return CommandFactory.createMatchesLatestVersionCommand(codeLens);

    if (codeLens.package.meta) {
      if (codeLens.package.meta.type === 'github')
        return CommandFactory.createGithubCommand(codeLens);

      if (codeLens.package.meta.type === 'file')
        return CommandFactory.createLinkCommand(codeLens);
    }

    return bowerGetPackageInfo(codeLens.package.name)
      .then(info => {
        return CommandFactory.createVersionCommand(
          codeLens.package.version,
          info.latest.version,
          codeLens
        );
      })
      .catch(err => {
        console.error(err);
        return CommandFactory.createErrorCommand(
          "An error occurred retrieving this package",
          codeLens
        );
      });
  }

}
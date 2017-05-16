/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as bower from 'bower';
import * as jsonParser from 'vscode-contrib-jsonc';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { bowerVersionParser } from './bowerVersionParser';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';
import { extractDependencyNodes, parseDependencyNodes } from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';
import appSettings from '../../common/appSettings';
import { clearDecorations } from '../../editor/decorations';

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
      bowerVersionParser
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
      return CommandFactory.createLatestCommand(codeLens);

    if (codeLens.package.meta) {
      if (codeLens.package.meta.type === 'github')
        return CommandFactory.createGithubCommand(codeLens);

      if (codeLens.package.meta.type === 'file')
        return CommandFactory.createLinkCommand(codeLens);
    }

    return new Promise(success => {
      bower.commands.info(codeLens.package.name)
        .on('end', info => {
          if (!info || !info.latest) {
            success(CommandFactory.createErrorCommand("Invalid object returned from server", codeLens));
            return;
          }
          success(CommandFactory.createVersionCommand(codeLens.package.version, info.latest.version, codeLens));
        })
        .on('error', err => {
          console.error(err);
          success(
            CommandFactory.createErrorCommand(
              "An error occurred retrieving this package.",
              codeLens
            )
          );
        });
    });
  }

}
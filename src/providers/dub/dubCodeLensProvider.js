/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as jsonParser from 'vscode-contrib-jsonc';
import * as httpRequest from 'request-light';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';
import {
  extractDependencyNodes,
  parseDependencyNodes,
  createDependencyNode
} from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';
import appSettings from '../../common/appSettings';
import { clearDecorations } from '../../editor/decorations';

export class DubCodeLensProvider extends AbstractCodeLensProvider {

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/dub.json'
    };
  }

  provideCodeLenses(document, token) {
    clearDecorations();

    if (appSettings.showVersionLenses === false)
      return;

    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const dependencyNodes = extractDependencyNodes(
      jsonDoc.root,
      appConfig.dubDependencyProperties
    );

    const subObjectNodes = this.extractCustomDependencyNodes(jsonDoc.root);
    dependencyNodes.push(...subObjectNodes)

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appConfig
    );

    return generateCodeLenses(packageCollection, document);
  }

  evaluateCodeLens(codeLens) {
    if (codeLens.command && codeLens.command.command.includes('updateDependenciesCommand'))
      return codeLens;

    if (codeLens.package.version === 'latest')
      return CommandFactory.makeLatestCommand(codeLens);

    if (codeLens.package.version === '~master')
      return CommandFactory.makeLatestCommand(codeLens);

    const queryUrl = `http://code.dlang.org/api/packages/${encodeURIComponent(codeLens.package.name)}/latest`;
    return httpRequest.xhr({ url: queryUrl })
      .then(response => {
        if (response.status != 200)
          return CommandFactory.makeErrorCommand(
            response.responseText,
            codeLens
          );

        const verionStr = JSON.parse(response.responseText);
        if (typeof verionStr !== "string")
          return CommandFactory.makeErrorCommand(
            "Invalid object returned from server",
            codeLens
          );

        return CommandFactory.makeVersionCommand(
          codeLens.package.version,
          verionStr,
          codeLens
        );
      })
      .catch(response => {
        const respObj = JSON.parse(response.responseText);
        console.error(respObj.statusMessage);
        return CommandFactory.makeErrorCommand(
          "An error occurred retrieving this package.",
          codeLens
        );
      });
  }

  extractCustomDependencyNodes(rootNode, customVersionParser) {
    const nodes = [];
    rootNode.getChildNodes()
      .forEach(childNode => {
        if (childNode.key.value == "subPackages") {
          childNode.value.items.forEach(subPackage => {
            if (subPackage.type == "object") {
              subPackage.properties.forEach(
                property => nodes.push(createDependencyNode(property))
              );
            }
          });

        }
      });
    return nodes;
  }

}
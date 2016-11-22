/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as jsonParser from 'vscode-contrib-jsonc';
import * as httpRequest from 'request-light';

import { PackageCodeLens } from '../../common/packageCodeLens';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';

export class DubCodeLensProvider extends AbstractCodeLensProvider {

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/dub.json'
    };
  }

  getPackageDependencyKeys() {
    return appConfig.dubDependencyProperties;
  }

  provideCodeLenses(document, token) {
    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const collector = new PackageCodeLensList(document, appConfig);
    this.collectDependencies_(collector, jsonDoc.root, null);
    if (collector.collection.length === 0)
      return [];

    return collector.collection;
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
        return CommandFactory.makeErrorCommand(
          respObj.statusMessage,
          codeLens
        );
      });
  }

  collectDependencies_(collector, rootNode, customVersionParser) {
    const packageDependencyKeys = this.getPackageDependencyKeys();
    rootNode.getChildNodes()
      .forEach(childNode => {
        if (packageDependencyKeys.includes(childNode.key.value)) {
          const childDeps = childNode.value.getChildNodes();
          // check if this node has entries and if so add the update all command
          if (childDeps.length > 0)
            CommandFactory.makeUpdateDependenciesCommand(
              childNode.key.value,
              collector.addNode(childNode),
              collector.collection
            );

          collector.addDependencyNodeRange(childDeps, customVersionParser);
          return;
        }

        if (childNode.key.value == "subPackages") {
          childNode.value.items
            .forEach(subPackage => {
              if (subPackage.type == "object")
                this.collectDependencies_(collector, subPackage, customVersionParser);
            });
        }
      });
  }

}
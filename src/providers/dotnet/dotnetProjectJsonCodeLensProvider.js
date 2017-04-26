/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as jsonParser from 'vscode-contrib-jsonc';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { DotNetAbstractCodeLensProvider } from './dotnetAbstractCodeLensProvider';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';

export class DotNetProjectJsonCodeLensProvider extends DotNetAbstractCodeLensProvider {

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/project.json'
    }
  }

  getPackageDependencyKeys() {
    return appConfig.dotnetProjectJsonDependencyProperties;
  }

  provideCodeLenses(document, token) {
    const jsonDoc = jsonParser.parse(document.getText());
    if (jsonDoc === null || jsonDoc.root === null || jsonDoc.validationResult.errors.length > 0)
      return [];

    const collector = new PackageCodeLensList(document, appConfig);
    this.collectDependencies_(collector, jsonDoc.root, null);
    if (collector.collection.length === 0)
      return [];

    return collector.collection;
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

        if (childNode.value.type === 'object')
          this.collectDependencies_(collector, childNode.value, customVersionParser);
      });
  }
}
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as jsonParser from 'vscode-contrib-jsonc';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { NpmCodeLensProvider } from '../npm/npmCodeLensProvider';
import { jspmVersionParser } from './jspmVersionParser';
import { appConfig } from '../../common/appConfiguration';

export class JspmCodeLensProvider extends NpmCodeLensProvider {

  provideCodeLenses(document, token) {
    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const collector = new PackageCodeLensList(document, appConfig);
    this.collectJspmDependencies_(collector, jsonDoc.root);
    if (collector.collection.length === 0)
      return [];

    return collector.collection;
  }

  collectJspmDependencies_(collector, rootNode) {
    const packageDependencyKeys = this.packageExtensionKeys;
    rootNode.getChildNodes()
      .forEach(node => {
        if (node.key.value === 'jspm')
          super.collectDependencies_(collector, node.value, jspmVersionParser)
      });
  }

}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as jsonParser from 'vscode-contrib-jsonc';
import { NpmCodeLensProvider } from '../npm/npmCodeLensProvider';
import { jspmVersionParser } from './jspmVersionParser';
import { appConfig } from '../../common/appConfiguration';
import { extractDependencyNodes, parseDependencyNodes } from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';
import appSettings from '../../common/appSettings';

export class JspmCodeLensProvider extends NpmCodeLensProvider {

  provideCodeLenses(document, token) {
    if(appSettings.showVersionLenses === false)
      return;

    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const jspmRootNode = this.getJspmRootNode_(jsonDoc.root);
    if (jspmRootNode === null)
      return;

    const dependencyNodes = extractDependencyNodes(
      jspmRootNode,
      appConfig.npmDependencyProperties
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appConfig,
      jspmVersionParser
    );

    return generateCodeLenses(packageCollection, document);
  }

  getJspmRootNode_(rootNode) {
    const children = rootNode.getChildNodes();
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.key.value === 'jspm')
        return node.value;
    }

    return null;
  }

}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { extractDependencyNodes } from '../../common/dependencyParser';

const jsonParser = require('vscode-contrib-jsonc');

export function findJspmRootNode(jsonContent) {
  const jsonDoc = jsonParser.parse(jsonContent);
  if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
    return null;

  const children = jsonDoc.root.getChildNodes();
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.key.value === 'jspm')
      return node.value;
  }

  return null;
}

export function findNodesInJsonContent(jsonContent, filterProperties) {
  const rootNode = findJspmRootNode(jsonContent);
  if (!rootNode)
    return [];

  const dependencyNodes = extractDependencyNodes(
    rootNode,
    filterProperties
  );

  return dependencyNodes;
}
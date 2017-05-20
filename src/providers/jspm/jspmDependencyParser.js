/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function getJspmRootNode(rootNode) {
  const children = rootNode.getChildNodes();
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.key.value === 'jspm')
      return node.value;
  }

  return null;
}
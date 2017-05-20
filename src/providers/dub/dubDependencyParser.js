/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDependencyNode } from '../../common/dependencyParser';

export function extractSubPackageDependencyNodes(rootNode) {
  const collector = [];
  rootNode.getChildNodes()
    .forEach(childNode => {
      if (childNode.key.value == "subPackages") {
        childNode.value.items.forEach(subPackage => {
          if (subPackage.type == "object") {
            subPackage.properties.forEach(
              property => collector.push(
                createDependencyNode(property)
              )
            );
          }
        });
      }
    });
  return collector;
}

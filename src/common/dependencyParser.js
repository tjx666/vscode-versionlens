/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function collectChildDependencyNodes(nodes, collector) {
  nodes.forEach(node => {
    const replaceInfo = {
      start: node.value.start,
      end: node.value.end
    };

    // check if the node's value is an object
    if (node.type === 'object') {
      // collect replace info and value from child.version
      replaceInfo = extractChildReplaceRange(node.value.getChildNodes());
    }

    collector.push(createDependencyNode(node, replaceInfo));
  });
}

function extractChildReplaceRange(childNodes) {
  for (let i = 0; i < childNodes.length; i++) {
    let node = childNodes[i];
    if (node.key.value === 'version') {
      return {
        start: node.value.start,
        end: node.value.end,
        value: node.value.value
      };
    }
  }
}

export function extractDependencyNodes(rootNode, filterList, collector = []) {
  rootNode.getChildNodes()
    .forEach(node => {
      // check if this node should be processed
      if (filterList.includes(node.key.value) == false)
        return;
      // collect the children
      const childNodes = node.value.getChildNodes();
      collectChildDependencyNodes(childNodes, collector);
    });

  return collector;
}

export function parseDependencyNodes(dependencyNodes, appConfig, customPackageParser = null) {
  const collector = [];
  for (let i = 0; i < dependencyNodes.length; i++) {
    const node = dependencyNodes[i];

    const parsedResult;
    if (customPackageParser)
      parsedResult = customPackageParser(node, appConfig);
    else
      parsedResult = { node };

    collector.push(Promise.resolve(parsedResult));
  }
  return collector;
}

export function createDependencyNode(node, replaceInfo) {
  if (!replaceInfo) {
    replaceInfo = {
      start: node.value.start,
      end: node.value.end,
    };
  }

  return {
    name: node.key.value,
    value: node.value.value,
    start: node.value.start,
    end: node.value.start,
    replaceInfo
  };
}
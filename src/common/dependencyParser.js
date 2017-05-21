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

  dependencyNodes.forEach(
    function (node) {
      let result = null;
      if (customPackageParser) {
        const { name, value } = node;
        result = customPackageParser(name, value, appConfig);

        // ensure the result is a promise
        result = Promise.resolve(result)
          .then(function (packageOrPackages) {
            if (Array.isArray(packageOrPackages) === false)
              return [{ node, package: packageOrPackages }];

            return packageOrPackages.map(
              pkg => {
                return { node, package: pkg }
              }
            );
          });
      }

      if (!result)
        result = Promise.resolve({ node });

      collector.push(result);
    }
  );

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
import {
  findRootNode,
  extractDependencyNodes,
  createDependencyNode
} from 'common/dependencyParser';

export function findNodesInJsonContent(jsonContent, filterProperties) {
  const rootNode = findRootNode(jsonContent);
  if (!rootNode)
    return [];

  const dependencyNodes = extractDependencyNodes(
    rootNode,
    filterProperties
  );

  const subObjectNodes = extractSubPackageDependencyNodes(rootNode);
  dependencyNodes.push(...subObjectNodes)

  return dependencyNodes;
}

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

const xmldoc = require('xmldoc');
const { Position, Range } = require('vscode');

export function findNodesInXmlContent(xmlContent, document, filterProperties) {
  const rootNode = new xmldoc.XmlDocument(document.getText());
  if (!rootNode)
    return [];

  const dependencyNodes = extractDependencyNodes(
    rootNode,
    document,
    filterProperties
  );

  return dependencyNodes;
}

export function extractDependencyNodes(rootNode, document, filterProperties) {
  const collector = [];
  rootNode.eachChild(group => {

    switch (group.name) {
      case "dependencies":
        group.eachChild(childNode => {
          if (!filterProperties.includes(childNode.name))
            return;

          const includeRange = {
            start: childNode.startTagPosition,
            end: childNode.startTagPosition,
          };

          collectFromChildVersionTag(childNode, includeRange, collector)

        });
        break;
      case "parent":
        if (!filterProperties.includes(group.name))
          return;

        const includeRange = {
          start: group.startTagPosition,
          end: group.startTagPosition,
        };

        collectFromChildVersionTag(group, includeRange, collector)
        break;
      default:
        break;
    }
  });

  return collector;
}

function collectFromChildVersionTag(parentNode, includeRange, collector) {
  parentNode.eachChild(childNode => {
    if (childNode.name !== "version")
      return;
    if (childNode.val.indexOf("$") >= 0) {
      return
    }
    // TODO: Check if is a version variable like '${spring.version}' and evaluate to get the real version

    const replaceInfo = {
      start: childNode.position,
      end: childNode.position + childNode.val.length,
    };

    let group = parentNode.childNamed("groupId").val
    let artifact = parentNode.childNamed("artifactId").val

    collector.push({
      start: includeRange.start,
      end: includeRange.end,
      name: group + ":" + artifact,
      value: childNode.val,
      replaceInfo
    });
  });
}
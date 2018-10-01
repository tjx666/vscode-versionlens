const xmldoc = require('xmldoc');
const { window } = require('vscode');

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

function extractPropertiesFromFile() {
  let properties = []
  if (window.activeTextEditor) {
    let xmlCurrentPom = new xmldoc.XmlDocument(window.activeTextEditor.document.getText())
    let propertiesCurrentPom = xmlCurrentPom.descendantWithPath("properties")
    propertiesCurrentPom.eachChild(property => {
      properties.push({
        name: property.name,
        val: property.val,
        position: property.position
      })
    })
  }
  return properties;
}


function collectFromChildVersionTag(parentNode, includeRange, collector) {
  parentNode.eachChild(childNode => {
    let versionNode;
    if (childNode.name !== "version")
      return;
    if (childNode.val.indexOf("$") >= 0) {
      let properties = extractPropertiesFromFile()
      let name = childNode.val.replace(/\$|\{|\}/ig, '')
      versionNode = properties.filter(property => {
        return property.name === name
      })[0]
    } else {
      versionNode = childNode;
    }
    // TODO: Check if is a version variable like '${spring.version}' and evaluate to get the real version

    const replaceInfo = {
      start: versionNode.position,
      end: versionNode.position + versionNode.val.length,
    };

    let group = parentNode.childNamed("groupId").val
    let artifact = parentNode.childNamed("artifactId").val

    let match = /\$\{(.*)\}/ig.exec(artifact);
    if (match) {
      let property = properties.filter(property => {
        return property.name === match[1]
      })[0]
      artifact = artifact.replace(/\$\{.*\}/ig, property.val)
    }

    collector.push({
      start: includeRange.start,
      end: includeRange.end,
      name: group + ":" + artifact,
      value: versionNode.val,
      replaceInfo
    });
  });
}
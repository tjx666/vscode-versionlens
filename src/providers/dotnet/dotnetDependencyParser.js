/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const xmldoc = require('xmldoc');
const { Range } = require('vscode');

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
    if (group.name !== 'ItemGroup')
      return;

    group.eachChild(childNode => {
      if (!filterProperties.includes(childNode.name))
        return;

      const includeRange = {
        start: childNode.startTagPosition,
        end: childNode.startTagPosition,
      };

      const hasVersionAttr = !!childNode.attr.Version;
      if (hasVersionAttr)
        collector.push(
          extractFromVersionAttribute(
            childNode,
            includeRange,
            document
          )
        )
      else if (childNode.children.length > 0)
        collectFromChildVersionTag(childNode, includeRange, collector)

    });
  });

  return collector;
}

function extractFromVersionAttribute(node, includeRange, document) {
  const lineText = document.getText(
    new Range(
      document.positionAt(node.startTagPosition),
      document.positionAt(node.position)
    )
  );
  const start = lineText.indexOf(' Version="') + 10;
  const end = lineText.indexOf('"', start);

  const replaceInfo = {
    start: node.startTagPosition + start,
    end: node.startTagPosition + end,
  };

  return {
    start: includeRange.start,
    end: includeRange.end,
    name: node.attr.Include || node.attr.Update,
    value: node.attr.Version,
    replaceInfo
  };
}

function collectFromChildVersionTag(parentNode, includeRange, collector) {
  parentNode.eachChild(childNode => {
    if (childNode.name !== "Version")
      return;

    const replaceInfo = {
      start: childNode.position,
      end: childNode.position + childNode.val.length,
    };

    collector.push({
      start: includeRange.start,
      end: includeRange.end,
      name: parentNode.attr.Include,
      value: childNode.val,
      replaceInfo
    });
  });
}
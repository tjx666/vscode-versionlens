/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { PackageLensData } from "common/packageLensData";

const xmldoc = require('xmldoc');
const { Range } = require('vscode');

export function extractDotnetLensDataFromText(document, filterPropertyNames: string[]): PackageLensData[] {
  const xmlDoc = new xmldoc.XmlDocument(document.getText());
  if (!xmlDoc) return [];

  return extractPackageLensDataFromNodes(xmlDoc, document, filterPropertyNames);
}

function extractPackageLensDataFromNodes(topLevelNodes, document, filterPropertyNames: string[]) {
  const collector = [];

  topLevelNodes.eachChild(
    function (node) {
      if (node.name !== "ItemGroup") return;
      node.eachChild(
        function (itemGroupNode) {
          if (filterPropertyNames.includes(itemGroupNode.name) == false) return;
          const packageLens = createPackageLensFromAttribute(itemGroupNode, document);
          collector.push(packageLens);
        }
      )
    }
  )

  return collector
}

function createPackageLensFromAttribute(node, document): PackageLensData {
  const lensRange = {
    start: node.startTagPosition,
    end: node.startTagPosition,
  }

  const lineText = document.getText(
    new Range(
      document.positionAt(node.startTagPosition),
      document.positionAt(node.position)
    )
  );
  const start = lineText.indexOf(' Version="') + 10;
  const end = lineText.indexOf('"', start);

  const versionRange = {
    start: node.startTagPosition + start,
    end: node.startTagPosition + end,
  }

  const packageInfo = {
    name: node.attr.Include || node.attr.Update,
    version: node.attr.Version,
  }

  return {
    lensRange,
    versionRange,
    packageInfo
  }
}
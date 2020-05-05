/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { PackageLensData } from "../shared/packageLensData";
const yamlParser = require("yaml");

export function extractPackageLensDataFromText(packageYamlText: string, filterPropertyNames: string[]): PackageLensData[] {
  const yamlDoc = yamlParser.parseDocument(packageYamlText);
  if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0) return [];

  return extractPackageLensDataFromNodes(yamlDoc.contents.items, filterPropertyNames);
}

export function extractPackageLensDataFromNodes(topLevelNodes, filterPropertyNames: string[]): PackageLensData[] {
  const collector = [];

  topLevelNodes.forEach(
    function (pair) {
      if (filterPropertyNames.includes(pair.key.value) === false) return;
      if (pair.value === null) return;
      collectDependencyNodes(pair.value.items, collector);
    }
  )

  return collector
}

function collectDependencyNodes(nodes, collector = []) {
  nodes.forEach(
    function (pair) {
      if (!pair.value) {
        // node may be in the form "no_version_dep:", which we ignore
        return;
      }
      if (typeof pair.value.value === 'string') {
        const packageLens = createPackageLensFromProperty(pair);
        collector.push(packageLens);
      }
    }
  )
}

export function createPackageLensFromProperty(pair): PackageLensData {
  const lensRange = {
    start: pair.key.range[0],
    end: pair.key.range[0],
  }
  const versionRange = {
    start: pair.value.range[0],
    end: pair.value.range[1],
  }

  if (pair.value.type === "QUOTE_SINGLE" || pair.value.type === "QUOTE_DOUBLE") {
    // +1 and -1 to be inside quotes
    versionRange.start++;
    versionRange.end--;
  }

  const packageInfo = {
    name: pair.key.value,
    version: pair.value.value
  }

  return {
    lensRange,
    versionRange,
    packageInfo
  }
}

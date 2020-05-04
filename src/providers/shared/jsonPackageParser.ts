import { PackageLensData } from "common/packageLensData";

const jsonParser = require("jsonc-parser");

export function extractPackageLensDataFromText(packageJsonText: string, filterPropertyNames: string[]): PackageLensData[] {
  const jsonErrors = [];
  const jsonTree = jsonParser.parseTree(packageJsonText, jsonErrors);
  if (!jsonTree || jsonTree.children.length === 0 || jsonErrors.length > 0) return [];
  return extractPackageLensDataFromNodes(jsonTree.children, filterPropertyNames);
}

export function extractPackageLensDataFromNodes(topLevelNodes, filterPropertyNames: string[]): PackageLensData[] {
  const collector = [];

  topLevelNodes.forEach(
    function (node) {
      const [keyEntry, valueEntry] = node.children;
      if (filterPropertyNames.includes(keyEntry.value) === false) return;
      collectDependencyNodes(valueEntry.children, collector);
    }
  )

  return collector
}

function collectDependencyNodes(nodes, collector = []) {
  nodes.forEach(
    function (node) {
      const [keyEntry, valueEntry] = node.children;

      if (valueEntry.type == "string") {
        const packageLens = createPackageLensFromProperty(keyEntry, valueEntry);
        collector.push(packageLens);
      } else if (valueEntry.type == "object") {
        collectDependencyNodes(valueEntry.children, collector)
      }
    }
  )
}

function createPackageLensFromProperty(keyEntry, valueEntry): PackageLensData {
  const lensRange = {
    start: keyEntry.offset,
    end: keyEntry.offset,
  }

  // +1 and -1 to be inside quotes
  const versionRange = {
    start: valueEntry.offset + 1,
    end: valueEntry.offset + valueEntry.length - 1,
  }

  const packageInfo = {
    name: keyEntry.value,
    version: valueEntry.value
  }

  return {
    lensRange,
    versionRange,
    packageInfo
  }
}

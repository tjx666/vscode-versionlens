// vscode references
import { PackageDependencyLens } from "../models/packageDependencyLens";

export function extractPackageDependenciesFromJson(json: string, filterPropertyNames: string[]): PackageDependencyLens[] {
  const jsonErrors = [];
  const jsonParser = require("jsonc-parser");
  const jsonTree = jsonParser.parseTree(json, jsonErrors);
  if (!jsonTree || jsonTree.children.length === 0 || jsonErrors.length > 0) return [];
  return extractFromNodes(jsonTree.children, filterPropertyNames);
}

export function extractFromNodes(topLevelNodes, filterPropertyNames: string[]): PackageDependencyLens[] {
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
        const dependencyLens = createFromProperty(keyEntry, valueEntry);
        collector.push(dependencyLens);
      } else if (valueEntry.type == "object") {
        collectDependencyNodes(valueEntry.children, collector)
      }
    }
  )
}

function createFromProperty(keyEntry, valueEntry): PackageDependencyLens {
  const nameRange = {
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
    nameRange,
    versionRange,
    packageInfo
  }
}

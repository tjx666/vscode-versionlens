import { PackageDependencyLens } from "core/packages/models/PackageDependencyLens";

const yamlParser = require("yaml");

export function extractPackageLensDataFromText(packageYamlText: string, filterPropertyNames: string[]): PackageDependencyLens[] {
  const yamlDoc = yamlParser.parseDocument(packageYamlText);
  if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0) return [];

  return extractPackageLensDataFromNodes(yamlDoc.contents.items, filterPropertyNames);
}

export function extractPackageLensDataFromNodes(topLevelNodes, filterPropertyNames: string[]): PackageDependencyLens[] {
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
      // node may be in the form "no_version_dep:", which we will indicate as the latest
      if (!pair.value || (pair.value.type === 'PLAIN' && !pair.value.value)) {
        pair.value = {
          range: [pair.key.range[1] + 2, pair.key.range[1] + 2],
          value: 'latest',
          type: null
        }
      }

      if (pair.value.type === 'MAP') {
        createPackageLensFromMapType(pair.value.items, pair.key, collector);
      } else if (typeof pair.value.value === 'string') {
        const packageLens = createPackageLensFromPlainType(pair);
        collector.push(packageLens);
      }
    }
  )
}

export function createPackageLensFromMapType(nodes, parentKey, collector) {
  nodes.forEach(
    function (pair) {
      // ignore empty entries
      if (!pair.value) return;

      if (pair.key.value === "version") {
        const lensRange = createRange(parentKey.range[0], parentKey.range[0], null);
        const versionRange = createRange(pair.value.range[0], pair.value.range[1], pair.value.type);
        const packageInfo = {
          name: parentKey.value,
          version: pair.value.value
        };
        collector.push({
          lensRange,
          versionRange,
          packageInfo
        });
      }
    }
  )

}

export function createPackageLensFromPlainType(pair): PackageDependencyLens {
  const lensRange = createRange(pair.key.range[0], pair.key.range[0], null);
  const versionRange = createRange(pair.value.range[0], pair.value.range[1], pair.value.type);
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

function createRange(start, end, valueType) {
  // +1 and -1 to be inside quotes
  const quoted = valueType === "QUOTE_SINGLE" || valueType === "QUOTE_DOUBLE";
  return {
    start: start + (quoted ? 1 : 0),
    end: end - (quoted ? 1 : 0),
  }
}
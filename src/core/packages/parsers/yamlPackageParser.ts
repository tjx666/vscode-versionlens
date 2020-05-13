import { PackageDependencyLens } from "../models/packageDependencyLens";

type YamlOptions = {
  hasCrLf: boolean,
  filterPropertyNames: Array<string>,
}

export function extractPackageDependenciesFromYaml(yaml: string, filterPropertyNames: Array<string>): PackageDependencyLens[] {
  const { Document, parseCST } = require('yaml');

  // verbose parsing to handle CRLF scenarios
  const cst = parseCST(yaml)

  // create and parse the document
  const yamlDoc = new Document({ keepCstNodes: true }).parse(cst[0])
  if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0) return [];

  const opts = {
    hasCrLf: yaml.indexOf('\r\n') > 0,
    filterPropertyNames,
  };

  return extractDependenciesFromNodes(yamlDoc.contents.items, opts);
}

export function extractDependenciesFromNodes(topLevelNodes, opts: YamlOptions): PackageDependencyLens[] {
  const collector = [];

  topLevelNodes.forEach(
    function (pair) {
      if (opts.filterPropertyNames.includes(pair.key.value) === false) return;
      if (pair.value === null) return;
      collectDependencyNodes(pair.value.items, opts, collector);
    }
  )

  return collector
}

function collectDependencyNodes(nodes, opts: YamlOptions, collector = []) {
  nodes.forEach(
    function (pair) {
      // node may be in the form "no_version_dep:", which we will indicate as the latest
      if (!pair.value || (pair.value.type === 'PLAIN' && !pair.value.value)) {
        const keyRange = getRangeFromCstNode(pair.key.cstNode, opts);
        pair.value = {
          range: [
            keyRange.end + 2,
            keyRange.end + 2,
          ],
          value: 'latest',
          type: null
        }
      }

      if (pair.value.type === 'MAP') {
        createDependencyLensFromMapType(pair.value.items, pair.key, opts, collector);
      } else if (typeof pair.value.value === 'string') {
        const dependencyLens = createDependencyLensFromPlainType(pair, opts);
        collector.push(dependencyLens);
      }
    }
  )
}

export function createDependencyLensFromMapType(nodes, parentKey, opts: YamlOptions, collector) {
  nodes.forEach(
    function (pair) {
      // ignore empty entries
      if (!pair.value) return;

      if (pair.key.value === "version") {
        const keyRange = getRangeFromCstNode(parentKey.cstNode, opts);
        const nameRange = createRange(
          keyRange.start,
          keyRange.start,
          null
        );
        const valueRange = getRangeFromCstNode(parentKey.cstNode, opts);
        const versionRange = createRange(
          valueRange.start,
          valueRange.end,
          pair.value.type
        );
        const packageInfo = {
          name: parentKey.value,
          version: pair.value.value
        };
        collector.push({
          nameRange,
          versionRange,
          packageInfo
        });
      }
    }
  )

}

export function createDependencyLensFromPlainType(pair, opts: YamlOptions): PackageDependencyLens {
  const keyRange = getRangeFromCstNode(pair.key.cstNode, opts);
  const nameRange = createRange(
    keyRange.start,
    keyRange.start,
    null
  );

  const valueRange = getRangeFromCstNode(pair.key.cstNode, opts);
  const versionRange = createRange(
    valueRange.start,
    valueRange.end,
    pair.value.type
  );
  const packageInfo = {
    name: pair.key.value,
    version: pair.value.value
  }
  return {
    nameRange,
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

function getRangeFromCstNode(cstNode, opts: YamlOptions) {
  const crLfLineOffset = opts.hasCrLf ?
    cstNode.rangeAsLinePos.start.line : 0;

  const start = cstNode.range.start + crLfLineOffset;
  const end = cstNode.range.end + crLfLineOffset;

  return { start, end }
}
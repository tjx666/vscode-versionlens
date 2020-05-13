import { PackageDependencyLens } from "core/packages";

type YamlOptions = {
  crlfOffset: number,
  filterPropertyNames: Array<string>,
}

export function extractPackageDependenciesFromYaml(yaml: string, filterPropertyNames: Array<string>): PackageDependencyLens[] {
  const yamlParser = require('yaml');
  const yamlDoc = yamlParser.parseDocument(yaml, { keepCstNodes: true });
  if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0) return [];

  const opts = {
    // yaml parser doesn't include CRLF in range positions
    // so this ensure CR is included in the line range result
    crlfOffset: yaml.indexOf('\r\n') > 0 ? 2 : 0,
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
        pair.value = {
          range: [
            pair.key.range[1] + 2 + opts.crlfOffset,
            pair.key.range[1] + 2 + opts.crlfOffset
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
        const nameRange = createRange(
          parentKey.range[0] + opts.crlfOffset,
          parentKey.range[0] + opts.crlfOffset,
          null
        );
        const versionRange = createRange(
          pair.value.range[0] + opts.crlfOffset,
          pair.value.range[1] + opts.crlfOffset,
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
  const nameRange = createRange(
    pair.key.range[0] + opts.crlfOffset,
    pair.key.range[0] + opts.crlfOffset,
    null
  );
  const versionRange = createRange(
    pair.value.range[0] + opts.crlfOffset,
    pair.value.range[1] + opts.crlfOffset,
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
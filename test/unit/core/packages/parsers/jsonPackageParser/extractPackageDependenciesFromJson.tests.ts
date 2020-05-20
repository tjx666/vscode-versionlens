import { extractPackageDependenciesFromJson } from 'core/packages';

import Fixtures from './extractPackageDependenciesFromJson.fixtures';

const assert = require('assert');

export default {

  "returns empty when no matches found": () => {
    const filterNames = []
    const results = extractPackageDependenciesFromJson('', filterNames);
    assert.equal(results.length, 0);
  },

  "returns empty when no dependency entry names match": () => {
    const filterNames = ["non-dependencies"]
    const results = extractPackageDependenciesFromJson('', filterNames);
    assert.equal(results.length, 0);
  },

  "extracts dependency entries from json": () => {
    const filterNames = ["dependencies"]
    const results = extractPackageDependenciesFromJson(
      JSON.stringify(Fixtures.extractDependencyEntries.test),
      filterNames
    );
    assert.deepEqual(results, Fixtures.extractDependencyEntries.expected);
  }

}
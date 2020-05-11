import { pluckSemverVersions } from 'providers/shared/versionUtils';

const assert = require('assert');

export default {

  "removes non-semver versions": () => {
    const testVersions = [
      '2.3.4.12341',
      '1.2.3.4444-test'
    ];
    const testResults = pluckSemverVersions(testVersions);
    assert.equal(testResults.length, 0, "returned invalid semver versions");
  },

  "returns semver versions": () => {
    const testVersions = [
      '1.2.3',
      '1.2.3-1',
      '1.2.3-beta',
      '1.2.3-beta+build',
      '1.2.3+build'
    ];

    const testResults = pluckSemverVersions(testVersions);
    assert.equal(testResults.length, testVersions.length, "returned invalid semver versions");
  },

}
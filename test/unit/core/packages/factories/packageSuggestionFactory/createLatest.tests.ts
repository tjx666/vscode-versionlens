import {
  SuggestionFactory,
  PackageVersionStatus,
  PackageSuggestionFlags
} from 'core/packages';

const assert = require('assert');

export default {

  "createLatest": {

    "when version param is undefined then returns 'latest' tagged package suggestion": () => {
      const actual = SuggestionFactory.createLatest()
      assert.deepEqual(
        actual,
        {
          name: PackageVersionStatus.Latest,
          version: PackageVersionStatus.Latest,
          flags: PackageSuggestionFlags.tag
        });
    },

    "when version param is a release then returns 'latest' version package suggestion": () => {
      const testRelease = '1.0.0';
      const actual = SuggestionFactory.createLatest(testRelease)
      assert.deepEqual(
        actual,
        {
          name: PackageVersionStatus.Latest,
          version: testRelease,
          flags: PackageSuggestionFlags.release
        });
    },

    "when version param is a prerelease then returns 'latest' version package suggestion": () => {
      const testRelease = '1.0.0-beta.1';
      const actual = SuggestionFactory.createLatest(testRelease)
      assert.deepEqual(
        actual,
        {
          name: PackageVersionStatus.LatestIsPrerelease,
          version: testRelease,
          flags: PackageSuggestionFlags.prerelease
        });
    },

  },

}
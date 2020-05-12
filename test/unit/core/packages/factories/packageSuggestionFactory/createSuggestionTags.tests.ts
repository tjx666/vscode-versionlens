import { createSuggestionTags } from 'core/packages/factories/packageSuggestionFactory';
import { PackageVersionStatus, PackageSuggestionFlags } from '/core/packages/models/packageDocument';

const assert = require('assert');

export default {

  "returns PackageVersionStatus.nomatch": {

    "when releases and prereleases are empty": () => {
      const expected = [
        {
          name: PackageVersionStatus.nomatch,
          version: '',
          flags: PackageSuggestionFlags.status
        }
      ]

      const testRange = '*'
      const testReleases = []
      const testPrereleases = []
      const results = createSuggestionTags(
        testRange,
        testReleases,
        testPrereleases
      );
      assert.equal(results.length, expected.length);
      assert.equal(results[0].name, expected[0].name);
      assert.equal(results[0].version, expected[0].version);
      assert.equal(results[0].flags, expected[0].flags);
    },

    "when releases or prereleases do not contain a matching version": () => {

      const expected = [
        {
          name: PackageVersionStatus.nomatch,
          version: '',
          flags: PackageSuggestionFlags.status
        },
        {
          name: PackageVersionStatus.latest,
          version: '1.0.0',
          flags: PackageSuggestionFlags.release
        }
      ]

      const testRange = '2.0.0'
      const testReleases = ['1.0.0']
      const testPrereleases = ['1.1.0-alpha.1']
      const results = createSuggestionTags(testRange, testReleases, testPrereleases);
      assert.deepEqual(results, expected);
    },

  },

  "returns PackageVersionStatus.latest": {

    "when versionRange matches the latest release": () => {

      const expected = [
        {
          name: PackageVersionStatus.latest,
          version: 'latest',
          flags: PackageSuggestionFlags.tag
        }
      ]

      const testReleases = ['1.0.0', '2.0.0', '2.1.0', '3.0.0']
      const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']
      const testRanges = [
        '3.0.0',
        '^3.0.0'
      ]

      testRanges.forEach(testRange => {
        const results = createSuggestionTags(testRange, testReleases, testPrereleases);
        assert.deepEqual(results, expected);
      })

    },

  },

  "returns PackageVersionStatus.satisfies": {

    "when versionRange satisfies the latest release": () => {

      const expected = [
        {
          name: PackageVersionStatus.satisfies,
          version: 'latest',
          flags: PackageSuggestionFlags.status
        },
        {
          name: PackageVersionStatus.latest,
          version: '3.0.0',
          flags: PackageSuggestionFlags.release
        },
        {
          name: 'next',
          version: '4.0.0-next',
          flags: PackageSuggestionFlags.prerelease
        }
      ]

      const testReleases = ['1.0.0', '2.0.0', '2.1.0', '3.0.0']
      const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']

      const results = createSuggestionTags('>=2', testReleases, testPrereleases);
      assert.deepEqual(results, expected);
    },

    "when versionRange satisfies a range in the releases": () => {

      const expected = [
        {
          name: PackageVersionStatus.satisfies,
          version: '2.1.0',
          flags: PackageSuggestionFlags.release
        },
        {
          name: PackageVersionStatus.latest,
          version: '3.0.0',
          flags: PackageSuggestionFlags.release
        }
      ]

      const testReleases = ['1.0.0', '2.0.0', '2.1.0', '3.0.0']
      const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']
      const testRanges = [
        '2.*'
      ]

      testRanges.forEach(testRange => {
        const results = createSuggestionTags(testRange, testReleases, testPrereleases);
        assert.deepEqual(results, expected);
      })

    },

  },


}
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import * as path from 'path';
import { TestFixtureMap } from '../../testUtils';
import {
  isFixedVersion,
  isOlderVersion,
  pluckSemverVersions,
  pluckTagsAndReleases,
  parseVersion,
  sortTagsByRecentVersion,
  removeExactVersions,
  removeOlderVersions,
  removeAmbiguousTagNames,
  filterTagsByName,
  buildMapFromVersionList,
  buildTagsFromVersionMap,
  deduceMaxSatisfyingFromSemverList,
  applyTagFilterRules
} from '../../../src/common/versionUtils';

describe('Versions', () => {

  const testPath = path.join(__dirname, '../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  describe('isOlderVersion', () => {

    it('Reports true for older versions and false for newer versions', () => {

      const older = [
        '1.2.2',
        '1.2.2',
        '1.0.0-beta.1',
        '1.0.0-beta.1'
      ];

      const newer = [
        '1.2.3',
        '1.2.3-beta.1',
        '1.0.1',
        '1.0.0-beta.2'
      ];

      older.forEach((olderVersion, index) => {
        const newerVersion = newer[index];
        assert.ok(
          isOlderVersion(olderVersion, newerVersion),
          `${olderVersion} should be older than ${newerVersion}`
        );
      });

      older.forEach((olderVersion, index) => {
        const newerVersion = newer[index];
        assert.ok(
          isOlderVersion(newerVersion, olderVersion) === false,
          `${newerVersion} should be newer than ${olderVersion}`
        );
      });

    });

  });

  describe('pluckSemverVersions', () => {

    it('removes non-semver versions', () => {
      const testVersions = [
        '2.3.4.12341',
        '1.2.3.4444-test'
      ];
      const testResults = pluckSemverVersions(testVersions);
      assert.equal(testResults.length, 0, "returned invalid semver versions");
    });

    it('returns semver versions', () => {
      const testVersions = [
        '1.2.3',
        '1.2.3-1',
        '1.2.3-beta',
        '1.2.3-beta+build',
        '1.2.3+build'
      ];

      const testResults = pluckSemverVersions(testVersions);
      assert.equal(testResults.length, testVersions.length, "returned invalid semver versions");
    });

  });

  describe('parseVersion', () => {

    it('reports non-prereleases', () => {
      const testVersions = [
        '1.2.3'
      ];

      testVersions.map(parseVersion)
        .forEach(result => { // assert
          assert.equal(
            result.isPrerelease, false,
            "shouldn't be set as prerelease"
          );
        });
    });

    it('reports prereleases', () => {
      const testPrereleases = [
        '1.2.3-alpha.1',
        '1.2.3-alpha-1',
        '1.2.3-alpha-1.build',
        '1.2.3-alpha.1-build',
        '1.2.3-beta.1',
        '1.2.3-beta-1',
        '1.2.3-beta-1.build',
        '1.2.3-beta.1-build'
      ];

      testPrereleases.map(parseVersion)
        .forEach(result => { // assert
          assert.equal(
            result.isPrerelease, true,
            "expected a prerelease"
          );
          assert.ok(
            result.version.includes(result.prereleaseGroup), true,
            "expected a prerelease group"
          );
        });
    });

    it('groups prereleases', () => {
      const testPrereleases = [
        '1.2.3-alpha.1',
        '1.2.3-alpha-1',
        '1.2.3-alpha-1.build',
        '1.2.3-alpha.1-build',
        '1.2.3-beta.1',
        '1.2.3-beta-1',
        '1.2.3-beta-1.build',
        '1.2.3-beta.1-build'
      ];

      const groups = [];

      const testResults = testPrereleases.map(parseVersion)
        .filter(result => {
          if (groups.includes(result.prereleaseGroup))
            return false

          groups.push(result.prereleaseGroup);
          return true;
        });

      assert.equal(
        testResults.length, 2,
        "expected 2 prerelease groups"
      );

      assert.equal(
        testResults[0].prereleaseGroup, 'alpha',
        "expected prerelease group to be 'alpha'"
      );

      assert.equal(
        testResults[1].prereleaseGroup, 'beta',
        "expected prerelease group to be 'beta'"
      );

    });

  });

  describe('pluckTagsAndReleases', () => {

    it('seperated tags and releases', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = pluckTagsAndReleases(testVersions);
      assert.equal(testResults.releases.length, 5, "returned invalid number of releases");
      assert.equal(testResults.taggedVersions.length, 46, "returned invalid number of tags");
    });

  });

  describe('isFixedVersion', () => {

    it('returns true for fixed versions', () => {
      assert.ok(
        isFixedVersion('1.2.3') === true,
        `1.2.3 should be a fixed version`
      );
    });

    it('returns false ranged versions', () => {

      const tests = [
        '~1.2.3',
        '>=1.2.3',
        '1.0.*'
      ];

      tests.forEach((testVersion, index) => {
        assert.ok(
          isFixedVersion(testVersion) === false,
          `${testVersion} should not be fixed at ${index}`
        );
      });

    });

  });

  describe('sortTagsByRecentVersion', () => {

    it('returns expected order', () => {
      const expected = [
        "5.0.0",
        "1.2.3",
        "1.2.3-zebra",
        "1.2.3-rc",
        "1.2.3-beta",
        "1.2.3-alpha",
        "0.0.3"
      ];

      const results = [
        '1.2.3-zebra',
        '1.2.3-alpha',
        '1.2.3',
        '1.2.3-beta',
        '0.0.3',
        '1.2.3-rc',
        '5.0.0'
      ].map(version => ({ version }))
        .sort(sortTagsByRecentVersion)

      assert.equal(
        results.length,
        expected.length,
        `results.length to be expected.length`
      );

      // console.log(tests.map(tag => tag.version))
      results.map(tag => tag.version)
        .forEach((testVersion, index) => {
          assert.equal(
            expected[index],
            testVersion,
            `${testVersion} to be ${expected[index]} at ${index}`
          );
        });

    });

  });

  describe('removeExactVersions', () => {

    it('removes exact matches', () => {
      const tests = [
        '1.2.3-zebra',
        '1.2.3-alpha',
        '1.2.3',
        '1.2.3-beta',
        '0.0.3',
        '1.2.3-rc',
        '5.0.0'
      ].map(version => ({ version }));

      const exactVersion = '1.2.3';
      const results = removeExactVersions.call(tests, exactVersion);
      results.map(tag => tag.version)
        .forEach(match => {
          assert.ok(match !== exactVersion, "did not filter exact matches");
        });

    });

  });


  describe('removeOlderVersions', () => {

    it('removes older versions', () => {
      const expected = [
        "5.0.0",
        "5.0.0-beta",
        "1.2.3"
      ];

      const tests = [
        "5.0.0",
        "5.0.0-beta",
        "1.2.3",
        "1.2.3-zebra",
        "1.2.3-rc",
        "1.2.3-beta",
        "1.2.3-alpha",
        "0.0.3"
      ].map(version => ({ version }));

      const testVersion = '1.2.3';
      const results = removeOlderVersions.call(tests, true, testVersion);
      assert.equal(
        results.length,
        expected.length,
        `results.length to be expected.length`
      );

      results.map(tag => tag.version)
        .forEach((testVersion, index) => {
          assert.equal(
            expected[index],
            testVersion,
            `${testVersion} to be ${expected[index]} at ${index}`
          );
        });

    });

  });

  describe('removeAmbiguousTagNames', () => {

    it("reduces ambiguous tag names", () => {
      const expected = [
        "latest",
        "next",
        // "v4.6-next",
        "latest",
        "next",
        // "v3.x-latest",
        // "3.x-latest",
        // "3.x-next",
        // "v3.x-next",
        "latest",
        "next",
        "lts",
        "latest"
      ];

      const distTags = JSON.parse(fixtureMap.read('npm/npm.json').content).distTags;
      const results = removeAmbiguousTagNames.call(distTags);
      assert.equal(
        results.length,
        expected.length,
        `results.length to be expected.length`
      );

      results.forEach((testVersion, index) => {
        assert.equal(
          expected[index],
          testVersion.name,
          `${testVersion.name} to be ${expected[index]} at ${index}`
        );
      });

    });

    it("preserves unambiguous tag names", () => {
      const expected = [
        "latest",
        "next",
        "beta",
        "legacy"
      ];

      const distTags = [
        { name: "latest", version: "4.6.1" },
        { name: "next", version: "4.6.1" },
        { name: "beta", version: "4.6.1" },
        { name: "legacy", version: "3.10.10" }
      ];

      const results = removeAmbiguousTagNames.call(distTags);
      assert.equal(
        results.length,
        expected.length,
        `results.length to be expected.length`
      );

    });

  });

  describe('filterTagsByName', () => {

    it('returns only tags in the specified filter array', () => {
      const testTags = [
        { name: 'latest' },
        { name: 'rc' },
        { name: 'beta' },
        { name: 'alpha' },
        { name: 'discovery' }
      ];
      const testFilter = ['rc', 'alpha'];
      const results = filterTagsByName(testTags, testFilter);

      assert.equal(
        results.length,
        testFilter.length,
        `Length not equal. Expected ${results.length} to be ${testFilter.length}`
      );

      assert.equal(
        results[0].name,
        testFilter[0],
        `tag.name[index]: Not equal. Expected ${results[0].name} to be ${testFilter[0]}`
      );

      assert.equal(
        results[1].name,
        testFilter[1],
        `tag.name[index]: Not equal. Expected ${results[1].name} to be ${testFilter[1]}`
      );
    });

  });



  describe('buildMapFromVersionList', () => {
    const testVersions = [
      "2.2.0",
      "2.2.0-rc4-build3536",
      "2.2.0-beta1-build3239",
      "2.1.0",
      "2.1.0-beta1-build2945",
      "2.0.0"
    ];

    it('returns expected releases', () => {
      const results = buildMapFromVersionList(testVersions, null);

      assert.equal(
        results.releases.length, 3,
        `releases.length not equal. Expected ${results.releases.length} to be 3`
      );

      assert.equal(
        results.releases[0], '2.2.0',
        'release entry did not match'
      );

      assert.equal(
        results.releases[1], '2.1.0',
        'release entry did not match'
      );

      assert.equal(
        results.releases[2], '2.0.0',
        'release entry did not match'
      );
    });

    it('returns expected taggedVersions', () => {
      const results = buildMapFromVersionList(testVersions, null);

      assert.equal(
        results.taggedVersions.length, 3,
        `taggedVersions.length not equal. Expected ${results.taggedVersions.length} to be 3`
      );

      assert.equal(
        results.taggedVersions[0].version, '2.2.0-rc4-build3536',
        'taggedVersion entry did not match'
      );

      assert.equal(
        results.taggedVersions[1].version, '2.2.0-beta1-build3239',
        'taggedVersion entry did not match'
      );

      assert.equal(
        results.taggedVersions[2].version, '2.1.0-beta1-build2945',
        'taggedVersion entry did not match'
      );
    });

  });

  describe('deduceMaxSatisfyingFromSemverList', () => {
    const testVersions = [
      "2.2.0",
      "2.2.0-rc4-build3536",
      "2.2.0-beta1-build3239",
      "2.1.0",
      "2.1.0-beta1-build2945",
      "2.0.0"
    ];

    it('when requested version is in range then returns satisfied verion', () => {
      const result = deduceMaxSatisfyingFromSemverList(testVersions, '2.1')
      assert.equal(result, '2.1.0', "Version mismatch")
    });

    it('when requested version is greater than any versions then returns null', () => {
      const result = deduceMaxSatisfyingFromSemverList(testVersions, '5')
      assert.equal(result, null, "Version mismatch")
    });

    it('when requested version is less than any versions then returns null', () => {
      const result = deduceMaxSatisfyingFromSemverList(testVersions, '1.0.0')
      assert.equal(result, null, "Version mismatch")
    });

    it('when requested version is null then returns null', () => {
      const result = deduceMaxSatisfyingFromSemverList(testVersions, null)
      assert.equal(result, null, "Version mismatch")
    });

  });

  describe('buildTagsFromVersionMap', () => {
    const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);

    it('returns newer tags than the requestedVersion when matches are found', () => {
      const requestedVersion = '2.0.0';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.equal(resultTags.length, 4, "Tag count not 4")
      assert.ok(resultTags[0].name == 'satisfies', "Tag name did not match")
      assert.ok(resultTags[0].versionMatchNotFound == false, "versionMatchNotFound should be false")
      assert.ok(resultTags[1].name == 'latest', "Tag name did not match")
      assert.ok(resultTags[2].name == 'beta', "Tag name did not match")
      assert.ok(resultTags[3].name == 'rc', "Tag name did not match")
    });

    it('returns latest and prerelease tags when requestedVersion does not match', () => {
      const requestedVersion = '0.0.0';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.equal(resultTags.length, 3, "Tag count not 3")
      assert.ok(resultTags[0].name == 'satisfies', "Tag name did not match")
      assert.ok(resultTags[0].versionMatchNotFound == true, "versionMatchNotFound should be true")
      assert.ok(resultTags[1].name == 'latest', "Tag name did not match")
      assert.ok(resultTags[2].name == 'beta', "Tag name did not match")
    });

    it('Should be no "latest" tag entry when requested version is already latest', () => {
      const requestedVersion = '2.2.0';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[1].name != 'latest', "Name should not match 'latest'")
    });

    it('no "latest" tag entry should exist when requested version range is already latest', () => {
      const requestedVersion = '~2.2.0';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[1].name != 'latest', "Name should not match 'latest'")
    });

    it('Should return a "latest" tag entry when requested version not the latest', () => {
      const requestedVersion = '2.3.0-beta2-build3683';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[1].name == 'latest', "Name should match 'latest'")
    });

    it('returns a "latest" tag entry when requested version range is not latest', () => {
      const requestedVersion = '^2.1.0';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[1].name === 'latest', "Name should match 'latest'");
    });

    it('"satisfies" tag entry should be latest and install latest when requested version is equal to the latest', () => {
      const requestedVersion = '2.2.0';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[0].isLatestVersion === true, "Should be latest version");
      assert.ok(resultTags[0].satisfiesLatest === true, "Should install latest version");
    });

    it('"satisfies" tag entry should not be latest but install latest when requested version satisfies the latest', () => {
      const requestedVersion = '^2.1.0';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[0].isLatestVersion === false, "Should not be latest version");
      assert.ok(resultTags[0].satisfiesLatest === true, "Should install latest version");
    });

    it('"satisfies" tag entry should not be latest or install latest when requested version does not satisfy the latest', () => {
      const requestedVersion = '~2.1.0';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[0].isLatestVersion === false, "Should not be latest version");
      assert.ok(resultTags[0].satisfiesLatest === false, "Should install latest version");
    });

    it('"satisfies".isInvalid is true when requested version is invalid', () => {
      const requestedVersion = 'sds11312';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[0].isInvalid === true, "isInvalid should be true")
    });

    it('"satisfies".isInvalid is false when requested version is valid', () => {
      testVersions.forEach(version => {
        const testVersionMap = buildMapFromVersionList(testVersions, version);
        const resultTags = buildTagsFromVersionMap(testVersionMap, version);
        assert.ok(resultTags[0].isInvalid === false, `${version} was not valid`);
      });
    });

    it('"satisfies".versionMatchNotFound is true when requested version does not match anything', () => {
      const requestedVersion = '1.2.3';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[0].versionMatchNotFound === true, "Matched a version that does not exist");
      assert.ok(resultTags[0].isInvalid === false, "Version should not be flagged as invalid");
    });

    it('"satisfies".versionMatchNotFound is false when requested version matches an existing versions', () => {
      const requestedVersion = '~1.9.1';
      const testVersionMap = buildMapFromVersionList(testVersions, requestedVersion);
      const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

      assert.ok(resultTags[0].versionMatchNotFound === false, "Did not match a version that does exists")
      assert.ok(resultTags[0].isInvalid === false, "Version should not be flagged as invalid");
    });

  });

  describe('applyTagFilterRules', () => {

    it("returns results ordered by recent version", () => {
      const expected = [
        "next",
        "lts"
      ];

      const distTags = JSON.parse(fixtureMap.read('npm/npm.json').content).distTags;
      const results = applyTagFilterRules(distTags, '1', '1.4.29', '4.6.1', false);

      assert.equal(
        results.length,
        expected.length,
        `Length not equal. Expected ${results.length} to be ${expected.length}`
      );

      results.map(result => result.name)
        .forEach((result, index) => {
          assert.equal(
            result,
            expected[index],
            `result[index].name: Not equal. Expected ${result} to be ${expected[index]}`
          )
        });
    });

  })


});
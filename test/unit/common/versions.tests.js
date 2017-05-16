/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import * as path from 'path';
import { TestFixtureMap } from '../../testUtils';
import { extractTagsFromVersionList, tagFilter, isOlderVersion } from '../../../src/common/versions';

describe('Versions', () => {

  const testPath = path.join(__dirname, '../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  describe('tagFilter', () => {

    it('returns all tags when no filter is specified', () => {
      const testTags = [
        { name: 'latest' },
        { name: 'rc' },
        { name: 'beta' },
        { name: 'alpha' },
        { name: 'discovery' }
      ];
      const testFilter = [];
      const results = tagFilter(testTags, testFilter);

      assert.equal(
        results.length,
        testTags.length,
        `Length not equal. Expected ${results.length} to be ${testTags.length}`
      );

      results.forEach((result, index) => {
        assert.equal(
          result.name,
          testTags[index].name,
          `tag.name[index]: Not equal. Expected ${result.name} to be ${testTags[index].name}`
        );
      })

    });

    it('returns only tags in the specified filter array', () => {
      const testTags = [
        { name: 'latest' },
        { name: 'rc' },
        { name: 'beta' },
        { name: 'alpha' },
        { name: 'discovery' }
      ];
      const testFilter = ['rc', 'alpha'];
      const results = tagFilter(testTags, testFilter);

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

  describe('extractTagsFromVersionList', () => {

    it('Extracts and groups all version tags', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, '1.2.3');
      assert.ok(testResults[0].name == 'satisfies', "Tag name did not match")
      assert.ok(testResults[1].name == 'latest', "Tag name did not match")
      assert.ok(testResults[2].name == 'beta', "Tag name did not match")
      assert.ok(testResults[3].name == 'rc', "Tag name did not match")
      assert.ok(testResults[4].name == 'alpha', "Tag name did not match")
    });

    it('Should be no "latest" tag entry when requested version is already latest', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, '2.2.0');
      assert.ok(testResults[1].name != 'latest', "Name should not match 'latest'")
    });

    it('no "latest" tag entry should exist when requested version range is already latest', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, '~2.2.0');
      assert.ok(testResults[1].name != 'latest', "Name should not match 'latest'")
    });

    it('Should return a "latest" tag entry when requested version not the latest', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, '2.3.0-beta2-build3683');
      assert.ok(testResults[1].name == 'latest', "Name should match 'latest'")
    });

    it('returns a "latest" tag entry when requested version range is not latest', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, '^2.1.0');
      assert.ok(testResults[1].name === 'latest', "Name should match 'latest'");
    });

    it('"satisfies" tag entry should be latest and install latest when requested version is equal to the latest', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, '2.2.0');
      assert.ok(testResults[0].isLatestVersion === true, "Should be latest version");
      assert.ok(testResults[0].satisfiesLatest === true, "Should install latest version");
    });

    it('"satisfies" tag entry should not be latest but install latest when requested version satisfies the latest', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, '^2.1.0');
      assert.ok(testResults[0].isLatestVersion === false, "Should not be latest version");
      assert.ok(testResults[0].satisfiesLatest === true, "Should install latest version");
    });

    it('"satisfies" tag entry should not be latest or install latest when requested version does not satisfy the latest', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, '~2.1.0');
      assert.ok(testResults[0].isLatestVersion === false, "Should not be latest version");
      assert.ok(testResults[0].satisfiesLatest === false, "Should install latest version");
    });

    it('"satisfies".isInvalid is true when requested version is invalid', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, 'sds11312');
      assert.ok(testResults[0].isInvalid === true, "isInvalid should be true")
    });

    it('"satisfies".isInvalid is false when requested version is valid', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      testVersions.forEach(version => {
        const testResults = extractTagsFromVersionList(testVersions, version);
        assert.ok(testResults[0].isInvalid === false, `${version} was not valid`);
      });
    });

    it('"satisfies".versionMatchNotFound is true when requested version does not match anything', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      const testResults = extractTagsFromVersionList(testVersions, '1.2.3');
      assert.ok(testResults[0].versionMatchNotFound === true, "Matched a version that does not exist");
      assert.ok(testResults[0].isInvalid === false, "Version should not be flagged as invalid");
    });

    it('"satisfies".versionMatchNotFound is false when requested version matches an existing versions', () => {
      const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
      let testResults = extractTagsFromVersionList(testVersions, '~1.9.1');
      assert.ok(testResults[0].versionMatchNotFound === false, "Did not match a version that does exists")
      assert.ok(testResults[0].isInvalid === false, "Version should not be flagged as invalid");
    });

  });

});
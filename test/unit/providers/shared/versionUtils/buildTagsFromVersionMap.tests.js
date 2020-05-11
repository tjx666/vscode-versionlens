import { TestFixtureMap } from 'test/unit/utils';
import { buildMapFromVersionList, buildTagsFromVersionMap } from 'providers/shared/versionUtils';

const assert = require('assert');

const fixtureMap = new TestFixtureMap('./fixtures');

let testContext = null

export default {

  beforeEach: () => {
    testContext = {}
    testContext.testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
  },

  "returns newer tags than the requestedVersion when matches are found": () => {
    const requestedVersion = '2.0.0';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.equal(resultTags.length, 4, "Tag count not 4")
    assert.ok(resultTags[0].name == 'satisfies', "Tag name did not match")
    assert.ok(resultTags[0].versionMatchNotFound == false, "versionMatchNotFound should be false")
    assert.ok(resultTags[1].name == 'latest', "Tag name did not match")
    assert.ok(resultTags[2].name == 'beta', "Tag name did not match")
    assert.ok(resultTags[3].name == 'rc', "Tag name did not match")
  },

  "returns latest and prerelease tags when requestedVersion does not match": () => {
    const requestedVersion = '0.0.0';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.equal(resultTags.length, 3, "Tag count not 3")
    assert.ok(resultTags[0].name == 'satisfies', "Tag name did not match")
    assert.ok(resultTags[0].versionMatchNotFound == true, "versionMatchNotFound should be true")
    assert.ok(resultTags[1].name == 'latest', "Tag name did not match")
    assert.ok(resultTags[2].name == 'beta', "Tag name did not match")
  },

  "Should be no 'latest' tag entry when requested version is already latest": () => {
    const requestedVersion = '2.2.0';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[1].name != 'latest', "Name should not match 'latest'")
  },

  "no 'latest' tag entry should exist when requested version range is already latest": () => {
    const requestedVersion = '~2.2.0';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[1].name != 'latest', "Name should not match 'latest'")
  },

  "Should return a 'latest' tag entry when requested version not the latest": () => {
    const requestedVersion = '2.3.0-beta2-build3683';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[1].name == 'latest', "Name should match 'latest'")
  },

  "returns a 'latest' tag entry when requested version range is not latest": () => {
    const requestedVersion = '^2.1.0';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[1].name === 'latest', "Name should match 'latest'");
  },

  "'satisfies' tag entry should be latest and install latest when requested version is equal to the latest": () => {
    const requestedVersion = '2.2.0';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[0].isLatestVersion === true, "Should be latest version");
    assert.ok(resultTags[0].satisfiesLatest === true, "Should install latest version");
  },

  "'satisfies'.latest is false when prerelease is same as release number": () => {
    const requestedVersion = '^2.0.0-beta.1';
    const testVersionMap = buildMapFromVersionList(['2.0.0', '2.0.0-beta.1'], requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[0].isLatestVersion === false, "Should not be latest version");
    assert.ok(resultTags[0].satisfiesLatest === true, "Should install latest version");
    assert.ok(resultTags[1].name === 'latest', "Latest tag should exist")
  },

  "'satisfies' tag entry should not be latest but install latest when requested version satisfies the latest": () => {
    const requestedVersion = '^2.1.0';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[0].isLatestVersion === false, "Should not be latest version");
    assert.ok(resultTags[0].satisfiesLatest === true, "Should install latest version");
  },

  "'satisfies' tag entry should not be latest or install latest when requested version does not satisfy the latest": () => {
    const requestedVersion = '~2.1.0';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[0].isLatestVersion === false, "Should not be latest version");
    assert.ok(resultTags[0].satisfiesLatest === false, "Should install latest version");
  },

  "'satisfies'.isInvalid is true when requested version is invalid": () => {
    const requestedVersion = 'sds11312';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[0].isInvalid === true, "isInvalid should be true")
  },

  "'satisfies'.isInvalid is false when requested version is valid": () => {
    testContext.testVersions.forEach(version => {
      const testVersionMap = buildMapFromVersionList(testContext.testVersions, version);
      const resultTags = buildTagsFromVersionMap(testVersionMap, version);
      assert.ok(resultTags[0].isInvalid === false, `${version} was not valid`);
    });
  },

  "'satisfies'.versionMatchNotFound is true when requested version does not match anything": () => {
    const requestedVersion = '1.2.3';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[0].versionMatchNotFound === true, "Matched a version that does not exist");
    assert.ok(resultTags[0].isInvalid === false, "Version should not be flagged as invalid");
  },

  "'satisfies'.versionMatchNotFound is false when requested version matches an existing versions": () => {
    const requestedVersion = '~1.9.1';
    const testVersionMap = buildMapFromVersionList(testContext.testVersions, requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[0].versionMatchNotFound === false, "Did not match a version that does exists")
    assert.ok(resultTags[0].isInvalid === false, "Version should not be flagged as invalid");
  },

  "does not fail if only prerelease versions": () => {
    const requestedVersion = '2.1.0-preview1-final';
    const testVersionMap = buildMapFromVersionList(['2.1.0-preview1-final'], requestedVersion);
    const resultTags = buildTagsFromVersionMap(testVersionMap, requestedVersion);

    assert.ok(resultTags[0].versionMatchNotFound === false, "Did not match a version that does exists");
    assert.ok(resultTags[0].isInvalid === false, "Version should not be flagged as invalid");
    assert.ok(resultTags[0].isLatestVersion === true, "Should be latest version");
    assert.ok(resultTags[0].satisfiesLatest === true, "Should install latest version");
  }

}
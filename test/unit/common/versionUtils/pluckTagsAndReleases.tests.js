/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TestFixtureMap } from 'test/unit/utils';
import { pluckTagsAndReleases } from 'common/versionUtils';

const fixtureMap = new TestFixtureMap('./fixtures');

const assert = require('assert');

export default {

  "seperated tags and releases": () => {
    const testVersions = JSON.parse(fixtureMap.read('nuget/xunit-versions.json').content);
    const testResults = pluckTagsAndReleases(testVersions);
    assert.equal(testResults.releases.length, 5, "returned invalid number of releases");
    assert.equal(testResults.taggedVersions.length, 46, "returned invalid number of tags");
  }

}
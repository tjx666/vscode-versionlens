/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { parseVersion } from 'common/versionUtils';

const assert = require('assert');

export default {

  "reports non-prereleases": () => {
    const testVersions = [
      '1.2.3'
    ];

    testVersions.map(parseVersion)
      .forEach(result => { // assert
        assert.equal(
          result.isPrerelease, false,
          "shouldn't be set as prerelease"
        );
      })
  },

  "reports prereleases": () => {
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
      })
  },

  "groups prereleases": () => {
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

  }

}
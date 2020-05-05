/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { buildMapFromVersionList } from 'providers/shared/versionUtils';

const assert = require('assert');

let testContext = null

export default {

    beforeEach: () => {
      testContext = {};
      testContext.testVersions = [
        "2.2.0",
        "2.2.0-rc4-build3536",
        "2.2.0-beta1-build3239",
        "2.1.0",
        "2.1.0-beta1-build2945",
        "2.0.0"
      ];
    },

    "returns expected releases": () => {
      const results = buildMapFromVersionList(testContext.testVersions, null);

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
    },

    "returns expected taggedVersions": () => {
      const results = buildMapFromVersionList(testContext.testVersions, null);

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
    }

}
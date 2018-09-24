/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { deduceMaxSatisfyingFromSemverList } from 'common/versionUtils';

const assert = require('assert');

let testContext = null

export default {

  beforeEach: () => {
    testContext = {}
    testContext.testVersions = [
      "2.2.0",
      "2.2.0-rc4-build3536",
      "2.2.0-beta1-build3239",
      "2.1.0",
      "2.1.0-beta1-build2945",
      "2.0.0"
    ];
  },

  "when requested version is in range then returns satisfied verion": () => {
    const result = deduceMaxSatisfyingFromSemverList(testContext.testVersions, '2.1')
    assert.equal(result, '2.1.0', "Version mismatch")
  },

  "when requested version is greater than any versions then returns null": () => {
    const result = deduceMaxSatisfyingFromSemverList(testContext.testVersions, '5')
    assert.equal(result, null, "Version mismatch")
  },

  "when requested version is less than any versions then returns null": () => {
    const result = deduceMaxSatisfyingFromSemverList(testContext.testVersions, '1.0.0')
    assert.equal(result, null, "Version mismatch")
  },

  "when requested version is null then returns null": () => {
    const result = deduceMaxSatisfyingFromSemverList(testContext.testVersions, null)
    assert.equal(result, null, "Version mismatch")
  }

}
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { compareVersions } from 'providers/maven/versionUtils'

const assert = require('assert');

let testContext = null

function assertOrder(versionA, versionB) {
  return (compareVersions(versionA, versionB) < 0)
}

function assertIsSame(versionA, versionB) {
  return (compareVersions(versionA, versionB) === 0)
}

export default {

  beforeEach: () => {
    testContext = {}
  },

  "Assert that first version": {

    "Is in order": () => {
      assert.equal(assertOrder("0.99", "1"), true, '"0.99" < "1"')
      assert.equal(assertOrder("1", "2"), true, '"1" < "2"')
      assert.equal(assertOrder("1.5", "2"), true, '"1.5" < "2"')
      assert.equal(assertOrder("1", "2.5"), true, '"1" < "2.5"')
      assert.equal(assertOrder("1.0", "1.1"), true, '"1.0" < "1.1"')
      assert.equal(assertOrder("1.1", "1.2"), true, '"1.1" < "1.2"')
      assert.equal(assertOrder("1.0.0", "1.1"), true, '"1.0.0" < "1.1"')
      assert.equal(assertOrder("1.0.1", "1.1"), true, '"1.0.1" < "1.1"')
      assert.equal(assertOrder("1.1", "1.2.0"), true, '"1.1" < "1.2.0"')
      assert.equal(assertOrder("3.8", "3.8.1"), true, '"3.8" < "3.8.1"')

      assert.equal(assertOrder("1.0-alpha-1", "1.0"), true, '"1.0-alpha-1" < "1.0"')
      assert.equal(assertOrder("1.0-alpha-1", "1.0-alpha-2"), true, '"1.0-alpha-1" < "1.0-alpha-2"')
      assert.equal(assertOrder("1.0-alpha-1", "1.0-beta-1"), true, '"1.0-alpha-1" < "1.0-beta-1"')

      assert.equal(assertOrder("1.0.1.20170215.211020-2", "1.0.7-SNAPSHOT"), true, '"1.0.1.20170215.211020-2" < "1.0.7-SNAPSHOT"')

      assert.equal(assertOrder("1.0-beta-1", "1.0-SNAPSHOT"), true, '"1.0-beta-1" < "1.0-SNAPSHOT"')
      assert.equal(assertOrder("1.0-SNAPSHOT", "1.0"), true, '"1.0-SNAPSHOT" < "1.0"')
      assert.equal(assertOrder("1.0-alpha-1-SNAPSHOT", "1.0-alpha-1"), true, '"1.0-alpha-1-SNAPSHOT" < "1.0-alpha-1"')

      assert.equal(assertOrder("1.0", "1.0-1"), true, '"1.0" < "1.0-1"')
      assert.equal(assertOrder("1.0.0", "1.0-1"), true, '"1.0.0" < "1.0-1"')
      assert.equal(assertOrder("1.0-1", "1.0.1"), true, '"1.0-1" < "1.0.1"')
      assert.equal(assertOrder("1.0-1", "1.0-2"), true, '"1.0-1" < "1.0-2"')

      assert.equal(assertOrder("1.0-alpha", "1.0"), true, '"1.0-alpha" < "1.0"')
      assert.equal(assertOrder("2.0-1", "2.0.1"), true, '"2.0-1" < "2.0.1"')
      assert.equal(assertOrder("2.0.1-klm", "2.0.1-lmn"), true, '"2.0.1-klm" < "2.0.1-lmn"')
      assert.equal(assertOrder("2.0.1", "2.0.1-xyz"), true, '"2.0.1" < "2.0.1-xyz"')

      assert.equal(assertOrder("2.0.1", "2.0.1-123"), true, '"2.0.1" < "2.0.1-123"')
      assert.equal(assertOrder("2.0.1-xyz", "2.0.1-123"), true, '"2.0.1-xyz" < "2.0.1-123"')
    },

    "Is equal": () => {
      assert.equal(assertIsSame("1", "1.0"), true, '"1" = "1.0"')
      assert.equal(assertIsSame("2", "2.0.0"), true, '"2" = "2.0.0"')
      assert.equal(assertIsSame("3.8.0", "3.8"), true, '"3.8.0" = "3.8"')
    }

  }

}
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { parseVersion, weightedQualifier } from 'providers/maven/versionUtils'

const assert = require('assert');

let testContext = null

export default {

  beforeEach: () => {
    testContext = {}
  },

  "Parsed should match": () => {
    assert.deepStrictEqual(parseVersion("1.2"), [1, 2])
    assert.deepStrictEqual(parseVersion("1.2-alpha"), [1, 2, [weightedQualifier('alpha')]])
  }

}
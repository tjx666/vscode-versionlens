/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { weightedQualifier } from 'providers/maven/versionUtils'

const assert = require('assert');

let testContext = null
export default {

  beforeEach: () => {
    testContext = {}
  },

  "Assert weigth of qualifiers": () => {
    assert.equal(weightedQualifier('alpha'), -7)
    assert.equal(weightedQualifier('beta'), -6)
    assert.equal(weightedQualifier('milestone'), -5)
    assert.equal(weightedQualifier('rc'), -4)
    assert.equal(weightedQualifier('snapshot'), -3)
    assert.equal(weightedQualifier('final'), -2)
    assert.equal(weightedQualifier('sp'), -1)
    assert.equal(weightedQualifier(''), '')
    assert.equal(weightedQualifier('abc'), 'abc')
  },

}
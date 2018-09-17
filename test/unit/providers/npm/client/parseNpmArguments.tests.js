/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { parseNpmArguments } from 'providers/npm/npmClient.js'

const mock = require('mock-require')
const assert = require('assert')

let npaMock = null
let testContext = null

export default {

  beforeAll: () => {
    // mock require modules
    npaMock = {
      resolve: (tname, tspec, twhere, targ) => { }
    }
    mock('npm-package-arg', npaMock)
  },

  // reset all require mocks
  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    testContext = {}

    // reset mock defaults
    npaMock.resolve = (tname, tspec, twhere, targ) => { }
  },

  "rejects when result is undefined": done => {
    npaMock.resolve = (tname, tspec, twhere, targ) => undefined

    parseNpmArguments("testName", "testVersion")
      .then(results => done(new Error("Should not be called")))
      .catch(actual => {
        assert.equal(actual.code, 'EUNSUPPORTEDPROTOCOL', `actual = ${actual}`)
        done()
      })
  },

  "resolves when result is defined": done => {
    const testResult = { type: 'tag' }
    npaMock.resolve = (tname, tspec, twhere, targ) => testResult

    parseNpmArguments("testName", "testVersion")
    .then(actual => {
      assert.equal(actual, testResult, `actual = ${actual}`)
      done()
    })
    .catch(error => done(error))
  },

}
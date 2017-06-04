/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { TestFixtureMap } from 'test/unit/utils'
import { npmViewVersion } from 'providers/npm/npmAPI'

const mock = require('mock-require')
const assert = require('assert')

let npmMock = null
let testContext = null

export const NpmViewVersionTests = {

  beforeAll: () => {
    // mock require modules
    npmMock = {
      commands: {}
    }
    mock('npm', npmMock)
  },

  // reset all require mocks
  afterAll: () => mock.stopAll,

  beforeEach: () => {
    testContext = {}

    // mock defaults
    npmMock.load = cb => cb(true)
    npmMock.commands.view = (name, args, cb) => cb()
  },

  "rejects on npm.load error": done => {
    npmMock.load = cb => cb("load error")

    npmViewVersion()
      .then(results => done(new Error("Should not be called")))
      .catch(actual => {
        assert.equal(actual, "load error", `actual = ${actual}`)
        done()
      })
  },

  "rejects on npm.view error": done => {
    npmMock.load = cb => cb()
    npmMock.commands.view = (n, v, cb) => cb("view error")

    npmViewVersion()
      .then(results => done(new Error("Should not be called")))
      .catch(actual => {
        assert.equal(actual, "view error", `actual = ${actual}`)
        done()
      })
  },

  "returns null for empty responses": done => {
    const response = {}
    npmMock.load = cb => cb()
    npmMock.commands.view = (n, v, cb) => cb(null, response)

    npmViewVersion()
      .then(actual => {
        assert.equal(actual, null, `actual = ${actual}`)
        done()
      })
      .catch(error => done(error))
  },

  "returns single versions": done => {
    const response = { '1.2.3': null }
    npmMock.load = cb => cb()
    npmMock.commands.view = (n, v, cb) => cb(null, response)

    npmViewVersion()
      .then(actual => {
        assert.equal(actual, '1.2.3', `actual = ${actual}`)
        done()
      })
      .catch(error => done(error))
  },

  "returns latest version first": done => {
    const response = { '1.2.3': null, '5.0.0': null, '1.1.1': null }
    npmMock.load = cb => cb()
    npmMock.commands.view = (n, v, cb) => cb(null, response)

    npmViewVersion()
      .then(actual => {
        assert.equal(actual, '5.0.0', `actual = ${actual}`)
        done()
      })
      .catch(error => done(error))
  }

}
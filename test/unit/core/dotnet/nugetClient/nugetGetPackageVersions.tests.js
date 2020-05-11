/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { nugetGetPackageVersions } from 'core/dotnet/nugetClient';

const assert = require('assert');
const mock = require('mock-require');

let requestLightMock = null;

export default {

  beforeAll: () => {
    // mock require modules
    requestLightMock = {
      xhr: options => { throw new Error("Not implemented") }
    }

    mock('request-light', requestLightMock)
  },

  // reset all require mocks
  afterAll: () => mock.stopAll,

  "resolves when a package is found": done => {
    const testPackageName = 'test-package';

    requestLightMock.xhr = options => {
      return Promise.resolve({
        status: 200,
        responseText: JSON.stringify({ "totalHits": 1, "data": ["1.0.0"] })
      })
    }

    nugetGetPackageVersions(testPackageName)
      .then(actual => {
        assert.ok(actual !== null, "Expected results array not to be null")
        assert.ok(actual.length === 1, "Expected results array to contain 1 item")
        done()
      })
      .catch(error => done(new Error("Should not be called")))
  },

  "rejects when a package is not found": done => {
    const testPackageName = 'test-package';

    requestLightMock.xhr = options => {
      return Promise.resolve({
        status: 200,
        responseText: JSON.stringify({ "totalHits": 0, "data": [] })
      })
    }

    nugetGetPackageVersions(testPackageName)
      .then(results => done(new Error("Should not be called")))
      .catch(actual => {
        assert.ok(actual !== null, "Expected error object not to be null")
        assert.ok(actual.status === 404, "Expected error status to be 404")
        done()
      })
  }

}
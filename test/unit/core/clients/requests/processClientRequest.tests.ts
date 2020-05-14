import {
  ProcessClientRequest,
  ClientResponseSource,
} from 'core/clients'

const assert = require('assert')
const mock = require('mock-require')

let requestLightMock = null

export const ProcessClientRequestTests = {

  beforeAll: () => {
    // mock require modules
    requestLightMock = {}
    mock('request-light', requestLightMock)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    requestLightMock.xhr = _ => { throw new Error("Not implemented") }
  },

  "requestJson": {

    "caches command response": async () => {
      const testResponse = {
        source: ClientResponseSource.local,
        status: 0,
        data: '123\n',
      }

      const expectedCacheData = {
        source: ClientResponseSource.cache,
        status: testResponse.status,
        data: testResponse.data,
      }

      const rut = new ProcessClientRequest()

      await rut.request(
        'echo',
        ['123'],
        'd:\\'
      ).then(response => {
        assert.deepEqual(response, testResponse)
      })

      await rut.request(
        'echo',
        ['123'],
        'd:\\'
      ).then(response => {
        assert.deepEqual(response, expectedCacheData)
      })

    },

    "doesn't cache when duration is 0": async () => {
      const testKey = 'echo 123';
      const testResponse = {
        source: ClientResponseSource.local,
        status: 0,
        data: '123\n',
      }

      const rut = new ProcessClientRequest(0)
      await rut.request(
        'echo',
        ['123'],
        'd:\\'
      ).then(response => {
        assert.deepEqual(response, testResponse)
      })

      await rut.request(
        'echo',
        ['123'],
        'd:\\'
      ).then(response => {
        assert.deepEqual(response, testResponse)

        const cachedData = rut.cache.get(testKey);
        assert.equal(cachedData, undefined);
      })

    },

  },

};
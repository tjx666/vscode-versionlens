import {
  JsonHttpClientRequest,
  ClientResponseSource,
  HttpRequestMethods,
} from 'core/clients'

const assert = require('assert')
const mock = require('mock-require')

let requestLightMock = null

export const JsonClientRequestTests = {

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

    "returns response as an object": async () => {
      const testUrl = 'https://test.url.example/path';
      const testQueryParams = {}
      const testResponse = {
        source: ClientResponseSource.remote,
        status: 404,
        responseText: '{ "item1": "not found" }',
      };

      const expectedCacheData = {
        source: ClientResponseSource.remote,
        status: testResponse.status,
        data: JSON.parse(testResponse.responseText),
      }

      requestLightMock.xhr = options => {
        return Promise.resolve(testResponse)
      };

      const rut = new JsonHttpClientRequest();

      await rut.requestJson(
        HttpRequestMethods.get,
        testUrl,
        testQueryParams
      )
        .then(response => {
          assert.deepEqual(response, expectedCacheData);
        })
    },

  },

};
import {
  ClientResponseSource,
  HttpClientRequestMethods,
  HttpRequestOptions,
} from 'core/clients'

import {
  JsonHttpClientRequest,
} from 'infrastructure/clients'
import { LoggerMock } from 'test/unit/mocks/loggerMock'

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

      const rut = new JsonHttpClientRequest(
        new LoggerMock(),
        <HttpRequestOptions>{
          caching: { duration: 30000 },
          http: { strictSSL: true }
        }
      );

      await rut.requestJson(
        HttpClientRequestMethods.get,
        testUrl,
        testQueryParams
      )
        .then(response => {
          assert.deepEqual(response, expectedCacheData);
        })
    },

  },

};
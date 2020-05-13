import { HttpResponseSources } from 'core/clients'

import {
  HttpRequest,
  HttpRequestMethods,
  createUrl
} from 'core/clients/requests/httpRequest'

const assert = require('assert')
const mock = require('mock-require')

let requestLightMock = null
let testContext = null

export const HttpRequestTests = {

  beforeAll: () => {
    testContext = {}
    // mock require modules
    requestLightMock = {}
    mock('request-light', requestLightMock)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    testContext.rut = new HttpRequest();
    requestLightMock.xhr = _ => { throw new Error("Not implemented") }
  },

  "request": {

    "generates the expected url with query params": async () => {
      const testUrl = 'https://test.url.example/path';

      const testQueryParams = [
        {},
        { param1: 1, param2: 2 }
      ]

      await Promise.all(

        testQueryParams.map(async function (params) {
          const expectedUrl = createUrl(testUrl, params);
          requestLightMock.xhr = options => {
            assert.equal(options.url, expectedUrl);
            assert.equal(options.type, HttpRequestMethods.get);
            return Promise.resolve({
              status: 200,
              responseText: null
            })
          };

          return await testContext.rut.request(
            HttpRequestMethods.get,
            testUrl,
            params
          )
        })
      )

    },

    "caches url response on success": async () => {
      const testUrl = 'https://test.url.example/path';
      const testQueryParams = {}
      const testResponse = { status: 200, responseText: "cached test", source: HttpResponseSources.remote };

      const expectedCacheData = {
        status: testResponse.status,
        responseText: testResponse.responseText,
        source: HttpResponseSources.cache,
      }

      requestLightMock.xhr = options => {
        return Promise.resolve(testResponse)
      };

      await testContext.rut.request(
        HttpRequestMethods.get,
        testUrl,
        testQueryParams
      )
        .then(response => {
          const cachedData = testContext.rut.cache.get('GET_' + testUrl);
          assert.deepEqual(cachedData, expectedCacheData);
        })
    },

    "caches url response when rejected": async () => {
      const testUrl = 'https://test.url.example/path';
      const testQueryParams = {}
      const testResponse = {
        status: 404,
        responseText: "not found",
        source: HttpResponseSources.remote
      };

      const expectedCacheData = {
        status: testResponse.status,
        responseText: testResponse.responseText,
        source: HttpResponseSources.cache,
      }

      requestLightMock.xhr = options => {
        return Promise.reject(testResponse)
      };

      await testContext.rut.request(
        HttpRequestMethods.get,
        testUrl,
        testQueryParams
      )
        .catch(response => {
          const cachedData = testContext.rut.cache.get('GET_' + testUrl);
          assert.deepEqual(cachedData, expectedCacheData);
        })
    },

    "does not cache when cache duration is 0": async () => {
      const testUrl = 'https://test.url.example/path';
      const testQueryParams = {}
      const expectedCacheData = undefined;
      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: JSON.stringify({ "message": "cached test" })
        })
      };

      testContext.rut = new HttpRequest({}, 0);

      await testContext.rut.request(
        HttpRequestMethods.get,
        testUrl,
        testQueryParams
      )
        .then(response => {
          const cachedData = testContext.rut.cache.get('GET_' + testUrl);
          assert.equal(cachedData, expectedCacheData);
        })
    },

  },

};
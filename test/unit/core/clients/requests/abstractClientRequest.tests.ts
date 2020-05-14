import {
  ClientResponseSource,
  AbstractClientRequest,
} from 'core/clients'

const assert = require('assert')

export const AbstractClientRequestTests = {

  "createCachedResponse": {

    "caches responses": () => {
      const testKey = 'https://test.url.example/path';
      const testStatus = 123;
      const testSource = ClientResponseSource.local;
      const testCache = "cached test";

      const expectedFirstResponse = {
        source: testSource,
        status: testStatus,
        data: testCache
      };

      const expectedCacheResponse = {
        source: ClientResponseSource.cache,
        status: testStatus,
        data: testCache
      };

      const rut = new class extends AbstractClientRequest<string> { }

      const actualFirstResp = rut.createCachedResponse(
        testKey,
        testStatus,
        testCache,
        testSource,
      )
      assert.deepEqual(actualFirstResp, expectedFirstResponse)

      // assert cache
      const actualCacheResp = rut.cache.get(testKey);
      assert.deepEqual(actualCacheResp, expectedCacheResponse)
    },

    "doesnt cache when duration is 0": () => {
      const testKey = 'https://test.url.example/path';
      const testStatus = 123;
      const testSource = ClientResponseSource.local;
      const testCache = "cached test";

      const expectedResponse = {
        source: testSource,
        status: testStatus,
        data: testCache
      };

      const rut = new (class extends AbstractClientRequest<string> { })(0)

      const actualFirstResp = rut.createCachedResponse(
        testKey,
        testStatus,
        testCache,
        testSource,
      )
      assert.deepEqual(actualFirstResp, expectedResponse)

      // assert cache
      const actualCacheResp = rut.cache.get(testKey);
      assert.deepEqual(actualCacheResp, undefined)

    },

  },

};
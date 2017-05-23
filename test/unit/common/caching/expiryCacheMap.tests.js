/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ExpiryCacheMap } from 'common/caching/expiryCacheMap';

const assert = require('assert');

export const ExpiryCacheMapTests = {

  "expired(key)": {

    "returns true when no key exists": () => {
      const testKey = 'missing';
      const testCacheMap = new ExpiryCacheMap(60000);
      assert.ok(testCacheMap.expired(testKey), 'ExpiryCacheMap.expired(key): A missing key should be expired');
    },

    "returns false when the a cache entry is still within the cache duration": () => {
      const testKey = 'key1';
      const testCacheMap = new ExpiryCacheMap(60000);
      testCacheMap.set(testKey, {});
      const actual = testCacheMap.expired(testKey);
      assert.ok(actual === false, 'ExpiryCacheMap.expired(key): A cache entry within the cache duration should NOT be expired');
    },

    "returns true when the cache entry is beyond the cache duration": () => {
      const testKey = 'key1';
      const testCacheMap = new ExpiryCacheMap(-1);
      testCacheMap.set(testKey, {});
      const actual = testCacheMap.expired(testKey);
      assert.ok(actual, 'ExpiryCacheMap.expired(key): A cache entry beyond the cache duration should be expired');
    }

  },

  "get(key)": {

    "returns undefined if the key does not exist": () => {
      const testKey = 'missing';
      const testCacheMap = new ExpiryCacheMap(60000);
      const actual = testCacheMap.get(testKey);
      assert.equal(actual, undefined, 'ExpiryCacheMap.get(key): Should return undefined when the key doesnt exist');
    },

    "returns the data by the key": () => {
      const testKey = 'key1';
      const testData = {};
      const testCacheMap = new ExpiryCacheMap(-1);
      testCacheMap.set(testKey, testData);
      const actual = testCacheMap.get(testKey);
      assert.equal(actual, testData, 'ExpiryCacheMap.set(key, data): Should store the data by the key');
    }

  },

  "set(key, data)": {

    "stores the data by the key": () => {
      const testKey = 'key1';
      const testData = {};
      const testCacheMap = new ExpiryCacheMap(60000);
      testCacheMap.set(testKey, testData);
      const actual = testCacheMap.get(testKey);
      assert.equal(actual, testData, 'ExpiryCacheMap.set(key, data): Should store the data by the key');
    },

    "returns the data that was set": () => {
      const testKey = 'key1';
      const testData = {};
      const testCacheMap = new ExpiryCacheMap(60000);
      const actual = testCacheMap.set(testKey, testData);
      assert.equal(actual, testData, 'ExpiryCacheMap.set(key, data): Should return the data');
    }

  }

}
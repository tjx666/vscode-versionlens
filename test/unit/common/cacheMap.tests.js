/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { CacheMap } from '../../../src/common/cacheMap';

describe('CacheMap', () => {

  describe('.expired(key)', () => {

    it('returns true when no key exists', () => {
      const testKey = 'missing';
      const testCacheMap = new CacheMap(60000);
      assert.ok(testCacheMap.expired(testKey), 'CacheMap.expired(key): A missing key should be expired');
    });

    it('returns false when the a cache entry is still within the cache duration', () => {
      const testKey = 'key1';
      const testCacheMap = new CacheMap(60000);
      testCacheMap.set(testKey, {});
      const actual = testCacheMap.expired(testKey);
      assert.ok(actual === false, 'CacheMap.expired(key): A cache entry within the cache duration should NOT be expired');
    });

    it('returns true when the cache entry is beyond the cache duration', () => {
      const testKey = 'key1';
      const testCacheMap = new CacheMap(-1);
      testCacheMap.set(testKey, {});
      const actual = testCacheMap.expired(testKey);
      assert.ok(actual, 'CacheMap.expired(key): A cache entry beyond the cache duration should be expired');
    });

  });

  describe('.get(key)', () => {

    it('returns undefined if the key does not exist', () => {
      const testKey = 'missing';
      const testCacheMap = new CacheMap(60000);
      const actual = testCacheMap.get(testKey);
      assert.equal(actual, undefined, 'CacheMap.get(key): Should return undefined when the key doesnt exist');
    });

    it('returns the data by the key', () => {
      const testKey = 'key1';
      const testData = {};
      const testCacheMap = new CacheMap(-1);
      testCacheMap.set(testKey, testData);
      const actual = testCacheMap.get(testKey);
      assert.equal(actual, testData, 'CacheMap.set(key, data): Should store the data by the key');
    });

  });

  describe('.set(key, data)', () => {

    it('stores the data by the key', () => {
      const testKey = 'key1';
      const testData = {};
      const testCacheMap = new CacheMap(60000);
      testCacheMap.set(testKey, testData);
      const actual = testCacheMap.get(testKey);
      assert.equal(actual, testData, 'CacheMap.set(key, data): Should store the data by the key');
    });

    it('returns the data that was set', () => {
      const testKey = 'key1';
      const testData = {};
      const testCacheMap = new CacheMap(60000);
      const actual = testCacheMap.set(testKey, testData);
      assert.equal(actual, testData, 'CacheMap.set(key, data): Should return the data');
    });

  });

});
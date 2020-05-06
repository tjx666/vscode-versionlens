/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export type CacheEntry = {
  expiryTime: number,
  data: any
};

type CacheMap = {
  [key: string]: CacheEntry;
};

export class ExpiryCacheMap {
  cacheDuration: number;
  cacheMap: CacheMap;

  constructor(cacheDuration: number = 300000) {
    this.cacheDuration = cacheDuration || 300000; // defaults to 5mins in ms
    this.cacheMap = {};
  }

  clear() {
    this.cacheMap = {};
  }

  hasExpired(key: string): boolean {
    const entry = this.cacheMap[key];
    if (!entry) return true;

    return Date.now() > entry.expiryTime;
  }

  expire(key: string): any {
    const entry = this.cacheMap[key];
    if (!entry) return true;

    delete this.cacheMap[key];
  }

  get(key: string): any {
    const entry = this.cacheMap[key];
    return entry && entry.data;
  }

  set(key: string, data: any): any {
    const expiryTime = Date.now() + this.cacheDuration;
    const newEntry = {
      expiryTime,
      data
    };
    this.cacheMap[key] = newEntry;
    return newEntry.data;
  }

}
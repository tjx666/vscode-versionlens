/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class CacheMap {

  constructor(cacheDuration) {
    this.cacheDuration = cacheDuration || 300000; // defaults to 5mins in ms
    this.data = {};
  }

  expired(key) {
    const entry = this.data[key];
    return !entry || Date.now() > entry.expiryTime;
  }

  get(key) {
    const entry = this.data[key];
    return entry && entry.data;
  }

  set(key, data) {
    const newEntry = {
      expiryTime: Date.now() + this.cacheDuration,
      data: data
    };
    this.data[key] = newEntry;
    return newEntry.data;
  }

}
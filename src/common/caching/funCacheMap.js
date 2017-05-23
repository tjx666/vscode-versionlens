import { ExpiryCacheMap } from './expiryCacheMap';

export class FunCacheMap extends ExpiryCacheMap {

  constructor(cacheDurationMs) {
    super(cacheDurationMs);
  }

  invoke(cacheKey, funToCache, args) {
    if (this.expired(cacheKey) === true) {
      return this.set(
        cacheKey,
        funToCache(...args)
      );
    }

    console.log("from cache", cacheKey);
    return this.get(cacheKey);
  }

}
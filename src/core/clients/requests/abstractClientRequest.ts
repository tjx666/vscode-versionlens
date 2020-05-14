import { ExpiryCacheMap } from '../../caching/expiryCacheMap';
import { ClientResponse, ClientResponseSource } from "../definitions/clientResponse";

export class AbstractClientRequest<T> {

  cache: ExpiryCacheMap;

  constructor(cacheDuration?: number) {
    this.cache = new ExpiryCacheMap(cacheDuration);
  }

  createCachedResponse(
    cacheKey: string,
    status: number,
    data: T,
    source: ClientResponseSource = ClientResponseSource.remote
  ): ClientResponse<T> {
    const cacheEnabled = this.cache.cacheDuration > 0;

    if (cacheEnabled) {
      //  cache reponse (don't return, keep immutable)
      this.cache.set(
        cacheKey,
        {
          source: ClientResponseSource.cache,
          status,
          data
        }
      );
    }

    // return original fetched data
    return {
      source,
      status,
      data
    };
  }

}
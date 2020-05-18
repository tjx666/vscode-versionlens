import { ExpiryCacheMap } from '../caching/expiryCacheMap';

import { ICachingOptions } from '../definitions/options';
import {
  ClientResponse,
  ClientResponseSource
} from "../definitions/clientResponses";

export class AbstractClientRequest<TStatus, TData> {

  cache: ExpiryCacheMap<ClientResponse<TStatus, TData>>;

  constructor(options: ICachingOptions) {
    this.cache = new ExpiryCacheMap(options);
  }

  createCachedResponse(
    cacheKey: string,
    status: TStatus,
    data: TData,
    rejected: boolean = false,
    source: ClientResponseSource = ClientResponseSource.remote
  ): ClientResponse<TStatus, TData> {
    const cacheEnabled = this.cache.options.duration > 0;

    if (cacheEnabled) {
      //  cache reponse (don't return, keep immutable)
      this.cache.set(
        cacheKey,
        {
          source: ClientResponseSource.cache,
          status,
          data,
          rejected
        }
      );
    }

    // return original fetched data
    return {
      source,
      status,
      data,
      rejected
    };
  }

}
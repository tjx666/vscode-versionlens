import { KeyStringDictionary } from 'core/generic/collections';
import { ILogger } from 'core/logging';

import {
  AbstractClientRequest,
  HttpClientResponse,
  IHttpClientRequest,
  HttpClientRequestMethods,
  UrlHelpers,
  ICachingOptions
} from 'core/clients';

type RequestLightHttpResponse = {
  status: number;
  responseText: string;
}

export class HttpClientRequest
  extends AbstractClientRequest<number, string>
  implements IHttpClientRequest {

  logger: ILogger;

  headers: KeyStringDictionary;

  constructor(logger: ILogger, options: ICachingOptions, headers?: KeyStringDictionary) {
    super(options);
    this.logger = logger;
    this.headers = headers || {};
  }

  async request(
    method: HttpClientRequestMethods,
    baseUrl: string,
    query: KeyStringDictionary = {}
  ): Promise<HttpClientResponse> {

    const url = UrlHelpers.createUrl(baseUrl, query);
    const cacheKey = method + '_' + url;

    if (this.cache.options.duration > 0 && this.cache.hasExpired(cacheKey) === false) {
      const cachedResp = this.cache.get(cacheKey);
      if (cachedResp.rejected) return Promise.reject(cachedResp);
      return Promise.resolve(cachedResp);
    }

    this.logger.debug("Requesting from %s", url)

    const requestLight = require('request-light');
    return requestLight.xhr({
      url,
      type: method,
      headers: this.headers
    })
      .then((response: RequestLightHttpResponse) => {
        return this.createCachedResponse(
          cacheKey,
          response.status,
          response.responseText,
          false
        );
      })
      .catch((response: RequestLightHttpResponse) => {
        const result = this.createCachedResponse(
          cacheKey,
          response.status,
          response.responseText,
          true
        );
        return Promise.reject<HttpClientResponse>(result);
      });
  }

}
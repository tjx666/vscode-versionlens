import { KeyStringDictionary } from 'core/generics';
import { ILogger } from 'core/logging';
import {
  AbstractClientRequest,
  HttpClientResponse,
  IHttpClientRequest,
  HttpClientRequestMethods,
  HttpRequestOptions,
  UrlHelpers,
} from 'core/clients';

import { RequestLightHttpResponse } from 'infrastructure/clients/definitions/responses';

export class HttpClientRequest
  extends AbstractClientRequest<number, string>
  implements IHttpClientRequest {

  logger: ILogger;

  headers: KeyStringDictionary;

  options: HttpRequestOptions;

  constructor(logger: ILogger, options: HttpRequestOptions) {
    super(options.caching);
    this.logger = logger;
    this.options = options;
  }

  async request(
    method: HttpClientRequestMethods,
    baseUrl: string,
    query: KeyStringDictionary = {},
    headers: KeyStringDictionary = {}
  ): Promise<HttpClientResponse> {

    const url = UrlHelpers.createUrl(baseUrl, query);
    const cacheKey = method + '_' + url;

    if (this.cache.options.duration > 0 && this.cache.hasExpired(cacheKey) === false) {
      const cachedResp = this.cache.get(cacheKey);
      if (cachedResp.rejected) return Promise.reject(cachedResp);
      return Promise.resolve(cachedResp);
    }

    const requestLight = require('request-light');
    return requestLight.xhr({
      url,
      type: method,
      headers,
      strictSSL: this.options.http.strictSSL
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
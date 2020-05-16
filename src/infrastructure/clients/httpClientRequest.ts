import { KeyStringDictionary } from 'core/generic/collections';
import { ILogger } from 'core/logging';

import {
  AbstractClientRequest,
  HttpClientResponse,
  IHttpClientRequest,
  HttpClientRequestMethods,
  UrlHelpers
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

  constructor(logger: ILogger, headers?: KeyStringDictionary, cacheDuration?: number) {
    super(cacheDuration);
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

    if (this.cache.cacheDuration > 0 && this.cache.hasExpired(cacheKey) === false) {
      return Promise.resolve(this.cache.get(cacheKey));
    }

    this.logger.debug("HttpRequest: %s", url)

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
          response.responseText
        );
      })
      .catch((response: RequestLightHttpResponse) => {
        const result = this.createCachedResponse(
          cacheKey,
          response.status,
          response.responseText
        );
        return Promise.reject<HttpClientResponse>(result);
      });
  }

}
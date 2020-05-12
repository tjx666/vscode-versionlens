import { KeyStringDictionary } from "../../definitions/generics";
import { ExpiryCacheMap } from '../../caching/expiryCacheMap';

export enum HttpRequestMethods {
  get = 'GET',
  head = 'HEAD',
}

export type HttpResponse = {
  status: number,
  responseText: string,
}

export class HttpRequest {

  cache: ExpiryCacheMap;
  headers: KeyStringDictionary;

  constructor(headers: KeyStringDictionary, cacheDuration: number) {
    this.cache = new ExpiryCacheMap(cacheDuration);
    this.headers = headers || {};
  }

  request(method: HttpRequestMethods, baseUrl: string, queryParams: KeyStringDictionary = {}): Promise<HttpResponse> {
    const url = createUrl(baseUrl, queryParams);
    const cacheKey = method + '_' + url;

    if (this.cache.cacheDuration > 0 && this.cache.hasExpired(cacheKey) === false) {
      return Promise.resolve(this.cache.get(cacheKey));
    }

    const requestLight = require('request-light');
    return requestLight.xhr({
      url,
      type: method,
      headers: this.headers
    })
      .then(response => {
        return this.cacheResponse(cacheKey, response);
      })
      .catch(response => {
        const result = this.cacheResponse(cacheKey, response);
        return Promise.reject(result);
      });
  }

  cacheResponse(cacheKey: string, response): HttpResponse {
    const parsedText = response.responseText;
    return {
      status: response.status,
      responseText: this.cache.cacheDuration > 0 ?
        this.cache.set(cacheKey, parsedText) :
        parsedText
    };
  }

}


export function createUrl(baseUrl: string, queryParams: KeyStringDictionary): string {
  const query = buildQueryParams(queryParams);

  const slashedUrl = query.length > 0 ?
    stripEndSlash(baseUrl) :
    baseUrl;

  return slashedUrl + query;
}

function buildQueryParams(queryParams: KeyStringDictionary): string {
  let query = '';
  if (queryParams) {
    query = Object.keys(queryParams)
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');
    query = (query.length > 0) ? '?' + query : '';
  }
  return query;
}

function stripEndSlash(url: string): string {
  return url.endsWith('/') ? url.substr(url.length - 1) : url;
}
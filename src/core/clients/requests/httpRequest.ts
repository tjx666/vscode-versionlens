import { KeyStringDictionary } from "../../definitions/generics";
import { ExpiryCacheMap } from '../../caching/expiryCacheMap';
import { HttpResponse, HttpResponseSources } from "../definitions/responseDefinitions";

export enum HttpRequestMethods {
  get = 'GET',
  head = 'HEAD'
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
        return this.createCachedResponse(
          cacheKey,
          response.status,
          response.responseText
        );
      })
      .catch(response => {
        const result = this.createCachedResponse(
          cacheKey,
          response.status,
          response.responseText
        );
        return Promise.reject<HttpResponse>(result);
      });
  }

  createCachedResponse(cacheKey: string, status: number, responseText: string): HttpResponse {
    const cacheEnabled = this.cache.cacheDuration > 0;

    if (cacheEnabled) {
      //  cache reponse (don't return, keep immutable)
      this.cache.set(
        cacheKey,
        {
          source: HttpResponseSources.cache,
          status,
          responseText
        }
      );
    }

    // return original remote data
    return {
      source: HttpResponseSources.remote,
      status,
      responseText
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
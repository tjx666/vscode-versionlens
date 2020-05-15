import { KeyStringDictionary } from 'core/generic/collections';

export enum RegistryProtocols {
  file = 'file:',
  https = 'https:',
}

export function getProtocolFromUrl(url: string): RegistryProtocols {
  const { parse } = require('url');
  const sourceUrl = parse(url);
  return (sourceUrl.protocol !== RegistryProtocols.https) ?
    RegistryProtocols.file :
    RegistryProtocols.https;
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
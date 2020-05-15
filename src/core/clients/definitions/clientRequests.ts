import { KeyStringDictionary } from 'core/generic/collections';

import {
  HttpClientResponse,
  JsonClientResponse,
  ProcessClientResponse
} from "./clientResponses";

export enum HttpClientRequestMethods {
  get = 'GET',
  head = 'HEAD'
}

export interface HttpClientRequestFn {
  (
    method: HttpClientRequestMethods,
    url: string,
    query: KeyStringDictionary
  ): Promise<HttpClientResponse>;
}

export interface IHttpClientRequest {
  request: HttpClientRequestFn
}

export interface JsonClientRequestFn {
  (
    method: HttpClientRequestMethods,
    url: string,
    query: KeyStringDictionary
  ): Promise<JsonClientResponse>;
}

export interface IJsonHttpClientRequest {
  requestJson: JsonClientRequestFn
}

export interface ProcessClientRequestFn {
  (
    cmd: string,
    args: Array<string>,
    cwd: string,
  ): Promise<ProcessClientResponse>
}

export interface IProcessClientRequest {
  request: ProcessClientRequestFn
}

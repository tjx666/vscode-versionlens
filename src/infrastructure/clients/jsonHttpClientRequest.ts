import { KeyStringDictionary } from 'core/generics';
import { ILogger } from 'core/logging';

import {
  HttpRequestOptions,
  HttpClientResponse,
  JsonClientResponse,
  HttpClientRequestMethods,
  IJsonHttpClientRequest,
} from "core/clients";

import { HttpClientRequest } from "./httpClientRequest";

export class JsonHttpClientRequest
  extends HttpClientRequest
  implements IJsonHttpClientRequest {

  constructor(logger: ILogger, options: HttpRequestOptions) {
    super(logger, options);
  }

  async requestJson(
    method: HttpClientRequestMethods,
    url: string,
    query: KeyStringDictionary = {},
    headers: KeyStringDictionary = {}
  ): Promise<JsonClientResponse> {
    return super.request(method, url, query, headers)
      .then(function (response: HttpClientResponse) {
        return {
          source: response.source,
          status: response.status,
          data: JSON.parse(response.data),
        }
      });
  }

}
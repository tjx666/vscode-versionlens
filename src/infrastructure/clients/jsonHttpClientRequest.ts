import { KeyStringDictionary } from "core/definitions/generics";

import {
  HttpClientResponse,
  JsonClientResponse,
  HttpClientRequestMethods,
  IJsonHttpClientRequest
} from "core/clients";

import { HttpClientRequest } from "./httpClientRequest";

export class JsonHttpClientRequest
  extends HttpClientRequest
  implements IJsonHttpClientRequest {

  constructor(headers?: KeyStringDictionary, cacheDuration?: number) {
    super(headers, cacheDuration);
  }

  async requestJson(
    method: HttpClientRequestMethods,
    url: string,
    query: KeyStringDictionary = {}
  ): Promise<JsonClientResponse> {
    return super.request(method, url, query)
      .then(function (response: HttpClientResponse) {
        return {
          source: response.source,
          status: response.status,
          data: JSON.parse(response.data),
        }
      });
  }

}
import { KeyStringDictionary, KeyDictionary } from "../../definitions/generics";
import { ClientResponse } from "../definitions/clientResponses";
import { HttpRequest, HttpRequestMethods, HttpClientResponse } from './httpClientRequest';

export type JsonClientResponse = ClientResponse<number, KeyDictionary<any>>;

export interface JsonRequestFunction {
  (
    method: HttpRequestMethods,
    url: string,
    queryParams: KeyStringDictionary
  ): Promise<JsonClientResponse>;
}

export interface IJsonHttpClientRequest {
  requestJson: JsonRequestFunction
}

export class JsonHttpClientRequest extends HttpRequest implements IJsonHttpClientRequest {

  constructor(headers?: KeyStringDictionary, cacheDuration?: number) {
    super(headers, cacheDuration);
  }

  async requestJson(
    method: HttpRequestMethods,
    url: string,
    queryParams: KeyStringDictionary = {}
  ): Promise<JsonClientResponse> {
    return super.request(method, url, queryParams)
      .then(function (response: HttpClientResponse) {
        return {
          source: response.source,
          status: response.status,
          data: JSON.parse(response.data),
        }
      });
  }

}
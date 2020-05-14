import { KeyStringDictionary } from "../../definitions/generics";
import { ClientResponseSource } from "../definitions/clientResponse";
import { HttpRequest, HttpRequestMethods } from './httpClientRequest';

export type JsonClientResponse = {
  source: ClientResponseSource,
  status: number,
  data: any
}

export class JsonHttpClientRequest extends HttpRequest {

  constructor(headers?: KeyStringDictionary, cacheDuration?: number) {
    super(headers, cacheDuration);
  }

  async requestJson(
    method: HttpRequestMethods,
    url: string,
    queryParams: KeyStringDictionary = {}
  ): Promise<JsonClientResponse> {
    return super.request(method, url, queryParams)
      .then(function (response) {
        return {
          source: response.source,
          status: response.status,
          data: JSON.parse(response.data),
        }
      });
  }


}
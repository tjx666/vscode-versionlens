import { KeyStringDictionary } from "../../definitions/generics";
import { JsonHttpResponse } from "../definitions/responseDefinitions";
import { HttpRequest, HttpRequestMethods } from './httpRequest';

export class JsonHttpRequest extends HttpRequest {

  constructor(headers: KeyStringDictionary, cacheDuration: number) {
    super(headers, cacheDuration);
  }

  async requestJson(
    method: HttpRequestMethods,
    url: string,
    queryParams: KeyStringDictionary = {}
  ): Promise<JsonHttpResponse> {
    return super.request(method, url, queryParams)
      .then(function (response) {
        return {
          source: response.source,
          status: response.status,
          data: JSON.parse(response.responseText),
        }
      });
  }


}
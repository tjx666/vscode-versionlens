import { KeyStringDictionary } from "../../definitions/generics";
import { HttpRequest, HttpRequestMethods } from './httpRequest';

export type JsonHttpResponse = {
  status: number,
  data: any
}

export class JsonHttpRequest extends HttpRequest {

  constructor(headers: KeyStringDictionary, cacheDuration: number) {
    super({}, cacheDuration);
  }

  getJson(url: string, queryParams: KeyStringDictionary = {}): Promise<JsonHttpResponse> {
    return super.request(HttpRequestMethods.get, url, queryParams)
      .then(function (response) {
        return {
          status: response.status,
          data: JSON.parse(response.responseText),
        }
      });
  }

}
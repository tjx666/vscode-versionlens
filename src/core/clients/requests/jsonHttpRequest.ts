import { KeyStringDictionary } from "../../definitions/generics";
import { HttpRequest, HttpRequestMethods, HttpResponseSources } from './httpRequest';

export type JsonHttpResponse = {
  source: HttpResponseSources,
  status: number,
  data: any
}

export class JsonHttpRequest extends HttpRequest {

  constructor(headers: KeyStringDictionary, cacheDuration: number) {
    super(headers, cacheDuration);
  }

  requestJson(method: HttpRequestMethods, url: string, queryParams: KeyStringDictionary = {}): Promise<JsonHttpResponse> {
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
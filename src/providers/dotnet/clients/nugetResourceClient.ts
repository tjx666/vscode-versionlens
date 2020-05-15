import {
  HttpClientResponse,
  HttpClientRequestMethods,
} from 'core/clients';

import {
  JsonHttpClientRequest
} from 'infrastructure/clients';

import { NugetServiceIndexResponse } from '../definitions/nuget';
import { DotNetSource } from '../definitions/dotnet';
import { DotNetConfig } from '../config';

export class NuGetResourceClient extends JsonHttpClientRequest {

  config: DotNetConfig;

  constructor(config: DotNetConfig, cacheDuration: number) {
    super({}, cacheDuration)
    this.config = config;
  }

  async fetchResource(source: DotNetSource): Promise<string> {

    return this.requestJson(HttpClientRequestMethods.get, source.url)
      .then((response: NugetServiceIndexResponse) => {
        const autocompleteServices = response.data.resources
          .filter(res => res["@type"] === 'SearchAutocompleteService');
        return autocompleteServices[0]["@id"];
      }).catch((error: HttpClientResponse) => {
        const feeds = this.config.getNuGetFeeds();
        return feeds.length > 0 ?
          feeds[0] :
          Promise.reject("Could not obtain a nuget resource")
      });

  }

}
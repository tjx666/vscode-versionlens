import { ILogger } from 'core/logging';
import {
  HttpClientResponse,
  HttpRequestOptions,
  HttpClientRequestMethods
} from 'core/clients';

import { JsonHttpClientRequest } from 'infrastructure/clients';

import { NugetServiceIndexResponse } from '../definitions/nuget';
import { DotNetSource } from '../definitions/dotnet';

export class NuGetResourceClient extends JsonHttpClientRequest {

  constructor(options: HttpRequestOptions, logger: ILogger) {
    super(logger, options)
  }

  async fetchResource(source: DotNetSource): Promise<string> {

    this.logger.debug("Requesting PackageBaseAddressService from %s", source.url)

    return await this.requestJson(HttpClientRequestMethods.get, source.url)
      .then((response: NugetServiceIndexResponse) => {

        const packageBaseAddressServices = response.data.resources
          .filter(res => res["@type"].indexOf('PackageBaseAddress') > -1);

        // just take one service for now
        const foundPackageBaseAddressServices = packageBaseAddressServices[0]["@id"];

        this.logger.debug(
          "Resolved PackageBaseAddressService endpoint: %O",
          foundPackageBaseAddressServices
        );

        return foundPackageBaseAddressServices;
      })
      .catch((error: HttpClientResponse) => {

        this.logger.error(
          "Could not resolve nuget service index. %s",
          error.data
        )

        return Promise.reject(error)
      });

  }

}
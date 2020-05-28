import { ILogger } from 'core/logging';
import {
  DocumentFactory,
  SuggestionFactory,
  PackageDocument,
  PackageSourceTypes,
  PackageVersionTypes,
  PackageRequest,
  VersionHelpers,
  IPackageClient,
  ResponseFactory,
} from 'core/packages';

import {
  HttpClientResponse,
  HttpClientRequestMethods,
  HttpRequestOptions,
  UrlHelpers,
} from 'core/clients';

import { JsonHttpClientRequest } from 'infrastructure/clients';

import { NuGetClientData } from '../definitions/nuget';
import { DotNetVersionSpec } from '../definitions/dotnet';
import { parseVersionSpec } from '../dotnetUtils.js';
import { DotNetConfig } from '../dotnetConfig';

export class NuGetPackageClient
  extends JsonHttpClientRequest
  implements IPackageClient<NuGetClientData> {

  config: DotNetConfig;

  constructor(config: DotNetConfig, options: HttpRequestOptions, logger: ILogger) {
    super(logger, options);
    this.config = config;
  }

  async fetchPackage(request: PackageRequest<NuGetClientData>): Promise<PackageDocument> {
    const dotnetSpec = parseVersionSpec(request.package.version);
    return this.fetchPackageRetry(request, dotnetSpec);
  }

  async fetchPackageRetry(
    request: PackageRequest<NuGetClientData>,
    dotnetSpec: DotNetVersionSpec
  ): Promise<PackageDocument> {
    const urls = request.clientData.serviceUrls;
    const autoCompleteUrl = urls[request.attempt];

    return createRemotePackageDocument(this, autoCompleteUrl, request, dotnetSpec)
      .catch((error: HttpClientResponse) => {

        // increase the attempt number
        request.attempt++;

        // only retry if 404 and we have more urls to try
        if (error.status === 404 && request.attempt < urls.length) {
          // retry
          return this.fetchPackageRetry(request, dotnetSpec)
        }

        if (error.status === 404) {
          return DocumentFactory.createNotFound(
            request.providerName,
            request.package,
            PackageVersionTypes.Version,
            ResponseFactory.createResponseStatus(error.source, 404)
          );
        }

        // unexpected
        return Promise.reject(error);
      });

  }

}

async function createRemotePackageDocument(
  client: JsonHttpClientRequest,
  url: string,
  request: PackageRequest<NuGetClientData>,
  dotnetSpec: DotNetVersionSpec
): Promise<PackageDocument> {

  const packageUrl = UrlHelpers.ensureEndSlash(url) + `${request.package.name}/index.json`;

  return client.requestJson(HttpClientRequestMethods.get, packageUrl)
    .then(function (httpResponse) {

      const { data } = httpResponse;

      const source = PackageSourceTypes.Registry;

      const { providerName } = request;

      const requested = request.package;

      const packageInfo = data;

      const response = {
        source: httpResponse.source,
        status: httpResponse.status,
      };

      // sanitize to semver only versions
      const rawVersions = VersionHelpers.filterSemverVersions(packageInfo.versions);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(rawVersions)

      // four segment is not supported
      if (dotnetSpec.spec && dotnetSpec.spec.hasFourSegments) {
        return DocumentFactory.createFourSegment(
          providerName,
          requested,
          ResponseFactory.createResponseStatus(httpResponse.source, 404),
          <any>dotnetSpec.type,
        )
      }

      // no match if null type
      if (dotnetSpec.type === null) {
        return DocumentFactory.createNoMatch(
          providerName,
          source,
          PackageVersionTypes.Version,
          requested,
          ResponseFactory.createResponseStatus(httpResponse.source, 404),
          // suggest the latest release if available
          releases.length > 0 ? releases[releases.length - 1] : null,
        )
      }

      const versionRange = dotnetSpec.resolvedVersion;

      const resolved = {
        name: requested.name,
        version: versionRange,
      };

      // analyse suggestions
      const suggestions = SuggestionFactory.createSuggestionTags(
        versionRange,
        releases,
        prereleases
      );

      return {
        providerName,
        source,
        response,
        type: dotnetSpec.type,
        requested,
        resolved,
        suggestions,
      };
    });
}


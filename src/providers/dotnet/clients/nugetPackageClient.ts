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
} from 'core/clients';

import {
  JsonHttpClientRequest
} from 'infrastructure/clients';

import { NuGetClientData } from '../definitions/nuget';
import { DotNetVersionSpec } from '../definitions/dotnet';

import { parseVersionSpec } from '../dotnetUtils.js';
import { DotNetConfig } from '../config';
import { ILogger } from 'core/logging';

export class NuGetPackageClient
  extends JsonHttpClientRequest
  implements IPackageClient<NuGetClientData> {

  config: DotNetConfig;

  constructor(config: DotNetConfig, cacheDuration: number, logger: ILogger) {
    super(logger, {}, cacheDuration)
    this.config = config;
  }

  async fetchPackage(request: PackageRequest<NuGetClientData>): Promise<PackageDocument> {
    const dotnetSpec = parseVersionSpec(request.package.version);

    const { autoCompleteUrl } = request.clientData;

    return createRemotePackageDocument(this, autoCompleteUrl, request, dotnetSpec)
      .catch((error: HttpClientResponse) => {
        if (error.status === 404) {
          return DocumentFactory.createNotFound(
            request.providerName,
            request.package,
            null,
            { status: error.status, source: error.source }
          );
        }
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

  const queryParams = {
    id: request.package.name,
    prerelease: 'true',
    semVerLevel: '2.0.0',
    take: '1'
  };

  return client.requestJson(HttpClientRequestMethods.get, url, queryParams)
    .then(function (httpResponse): PackageDocument {

      const { data } = httpResponse;

      const source = PackageSourceTypes.Registry;

      const { providerName } = request;

      const requested = request.package;

      if (data.totalHits === 0) {
        return DocumentFactory.createNotFound(
          providerName,
          requested,
          PackageVersionTypes.Version,
          ResponseFactory.createResponseStatus(httpResponse.source, 404)
        )
      }

      const packageInfo = data;

      const response = {
        source: httpResponse.source,
        status: httpResponse.status,
      };

      // sanitize to semver only versions
      const rawVersions = VersionHelpers.filterSemverVersions(packageInfo.data);

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
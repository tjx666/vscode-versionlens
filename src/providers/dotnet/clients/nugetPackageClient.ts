import {
  DocumentFactory,
  SuggestionFactory,
  PackageDocument,
  PackageSourceTypes,
  PackageVersionTypes,
  PackageRequest,
  VersionHelpers,
  IPackageClient,
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

  options: DotNetConfig;

  constructor(
    config: DotNetConfig,
    cacheDuration: number,
    logger: ILogger
  ) {
    super(logger, {}, cacheDuration)
    this.options = config;
  }

  async fetchPackage(request: PackageRequest<NuGetClientData>): Promise<PackageDocument> {
    const dotnetSpec = parseVersionSpec(request.package.version);

    const { autoCompleteUrl } = request.clientData;

    return createRemotePackageDocument(this, autoCompleteUrl, request, dotnetSpec)
      .catch((error: HttpClientResponse) => {
        if (error.status === 404) {
          return DocumentFactory.createNotFound(
            request.clientData.provider,
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
    .then(httpResponse => {

      const { data } = httpResponse;

      if (data.totalHits === 0) {
        return Promise.reject({ status: 404, data })
      }

      const packageInfo = data;

      const source = PackageSourceTypes.registry;

      const provider = request.providerName;

      const requested = request.package;

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
        return Promise.resolve(DocumentFactory.createFourSegment(
          provider,
          requested,
          response,
          dotnetSpec.type,
        ))
      }

      // no match if null type
      if (dotnetSpec.type === null) {
        return Promise.resolve(DocumentFactory.createNoMatch(
          provider,
          source,
          PackageVersionTypes.version,
          requested,
          response,
          // suggest the latest release if available
          releases.length > 0 ? releases[releases.length - 1] : null,
        ))
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
        provider,
        source,
        response,
        type: dotnetSpec.type,
        requested,
        resolved,
        releases,
        prereleases,
        suggestions,
      };
    });
}
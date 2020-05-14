import {
  PackageRequest,
  PackageIdentifier,
  DocumentFactory,
  ResponseFactory,
  PackageDocument,
  PackageSourceTypes,
  SuggestionFactory,
  VersionHelpers,
  SemverSpec,
  IPackageClient,
} from 'core/packages';

import {
  JsonHttpClientRequest,
  HttpRequestMethods,
  HttpClientResponse,
  JsonRequestFunction,
} from "core/clients";

import { PubConfig } from './config';

export class PubClient
  extends JsonHttpClientRequest
  implements IPackageClient<PubConfig> {

  constructor(cacheDuration: number) {
    super({}, cacheDuration)
  }

  async fetchPackage(request: PackageRequest<PubConfig>): Promise<PackageDocument> {
    const semverSpec = VersionHelpers.parseSemver(request.package.version);
    const url = `${request.clientData.getApiUrl()}/api/documentation/${request.package.name}`;

    return createRemotePackageDocument(this, url, request, semverSpec)
      .catch((error: HttpClientResponse) => {
        if (error.status === 404) {
          return DocumentFactory.createNotFound(
            request.clientData.provider,
            request.package,
            null,
            ResponseFactory.createResponseStatus(error.source, error.status)
          );
        }
        return Promise.reject(error);
      });
  }

}

async function createRemotePackageDocument(
  client: JsonHttpClientRequest,
  url: string,
  request: PackageRequest<PubConfig>,
  semverSpec: SemverSpec
): Promise<PackageDocument> {

  return client.requestJson(HttpRequestMethods.get, url, {})
    .then(httpResponse => {

      const packageInfo = httpResponse.data;

      const provider = request.provider;

      const versionRange = semverSpec.rawVersion;

      const requested = request.package;

      const resolved = {
        name: requested.name,
        version: versionRange,
      };

      const response = {
        source: httpResponse.source,
        status: httpResponse.status,
      };

      const rawVersions = VersionHelpers.extractVersionsFromMap(packageInfo.versions);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(rawVersions)

      // analyse suggestions
      const suggestions = SuggestionFactory.createSuggestionTags(
        versionRange,
        releases,
        prereleases
      );

      // return PackageDocument
      return {
        provider,
        source: PackageSourceTypes.registry,
        response,
        type: semverSpec.type,
        requested,
        resolved,
        releases,
        prereleases,
        suggestions,
      };

    });
}
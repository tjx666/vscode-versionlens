import {
  PackageRequest,
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
  HttpClientRequestMethods,
  HttpClientResponse,
} from "core/clients";

import {
  JsonHttpClientRequest
} from 'infrastructure/clients';

import { PubConfig } from './config';
import { ILogger } from 'core/logging';

export class PubClient
  extends JsonHttpClientRequest
  implements IPackageClient<null> {

  config: PubConfig;

  constructor(
    config: PubConfig,
    cacheDuration: number,
    logger: ILogger
  ) {
    super(logger, {}, cacheDuration)
    this.config = config;
  }

  async fetchPackage(request: PackageRequest<null>): Promise<PackageDocument> {
    const semverSpec = VersionHelpers.parseSemver(request.package.version);
    const url = `${this.config.getApiUrl()}/api/documentation/${request.package.name}`;

    return createRemotePackageDocument(this, url, request, semverSpec)
      .catch((error: HttpClientResponse) => {
        if (error.status === 404) {
          return DocumentFactory.createNotFound(
            request.providerName,
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
  request: PackageRequest<null>,
  semverSpec: SemverSpec
): Promise<PackageDocument> {

  return client.requestJson(HttpClientRequestMethods.get, url, {})
    .then(function (httpResponse): PackageDocument {

      const packageInfo = httpResponse.data;

      const { providerName } = request;

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
        providerName,
        source: PackageSourceTypes.Registry,
        response,
        type: semverSpec.type,
        requested,
        resolved,
        suggestions,
      };

    });
}
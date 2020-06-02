import { ILogger } from 'core.logging';

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
} from 'core.packages';

import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IJsonHttpClient
} from 'core.clients';

import { PubConfig } from './pubConfig';

export class PubClient implements IPackageClient<null> {

  config: PubConfig;

  client: IJsonHttpClient;

  logger: ILogger;

  constructor(config: PubConfig, client: IJsonHttpClient, logger: ILogger) {
    this.config = config;
    this.logger = logger;
    this.client = client;
  }

  async fetchPackage(request: PackageRequest<null>): Promise<PackageDocument> {
    const semverSpec = VersionHelpers.parseSemver(request.package.version);
    const url = `${this.config.apiUrl}/api/documentation/${request.package.name}`;

    return this.createRemotePackageDocument(url, request, semverSpec)
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

  async createRemotePackageDocument(
    url: string,
    request: PackageRequest<null>,
    semverSpec: SemverSpec
  ): Promise<PackageDocument> {

    const query = {};
    const headers = {};

    return this.client.request(HttpClientRequestMethods.get, url, query, headers)
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

}
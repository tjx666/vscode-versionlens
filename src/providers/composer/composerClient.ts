import {
  DocumentFactory,
  ResponseFactory,
  SuggestionFactory,
  VersionHelpers,
  PackageRequest,
  PackageDocument,
  PackageSourceTypes,
  SemverSpec,
  IPackageClient
} from "core/packages";

import {
  HttpClientRequestMethods,
  HttpClientResponse,
  JsonClientResponse,
} from "core/clients";

import { JsonHttpClientRequest } from 'infrastructure/clients';

import { ComposerConfig } from './config';
import { ILogger } from "core/logging";

export class ComposerClient
  extends JsonHttpClientRequest
  implements IPackageClient<null> {

  config: ComposerConfig;

  constructor(config: ComposerConfig, logger: ILogger) {
    super(logger, {}, config.cacheDuration)
    this.config = config;
  }

  async fetchPackage<TClientData>(request: PackageRequest<TClientData>): Promise<PackageDocument> {
    const semverSpec = VersionHelpers.parseSemver(request.package.version);
    const url = `${this.config.apiUrl}/${request.package.name}.json`;

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

async function createRemotePackageDocument<TClientData>(
  client: JsonHttpClientRequest,
  url: string,
  request: PackageRequest<TClientData>,
  semverSpec: SemverSpec
): Promise<PackageDocument> {

  return client.requestJson(HttpClientRequestMethods.get, url, {})
    .then(function (httpResponse: JsonClientResponse): PackageDocument {
      const packageInfo = httpResponse.data.packages[request.package.name];

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

      const rawVersions = Object.keys(packageInfo);

      // extract semver versions only
      const semverVersions = VersionHelpers.filterSemverVersions(rawVersions);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(
        VersionHelpers.filterSemverVersions(semverVersions)
      );

      // analyse suggestions
      const suggestions = SuggestionFactory.createSuggestionTags(
        versionRange,
        releases,
        prereleases
      );

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

export function readComposerSelections(filePath) {

  return new Promise(function (resolve, reject) {
    const fs = require('fs');

    if (fs.existsSync(filePath) === false) {
      reject(null);
      return;
    }

    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err)
        return;
      }

      const selectionsJson = JSON.parse(data.toString());

      resolve(selectionsJson);
    });

  });

}


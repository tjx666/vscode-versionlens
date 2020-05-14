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
  JsonHttpClientRequest,
  HttpRequestMethods,
  HttpClientResponse,
  JsonClientResponse,
} from "core/clients";

import { ComposerConfig } from './config';

export class ComposerClient
  extends JsonHttpClientRequest
  implements IPackageClient<ComposerConfig> {

  constructor(cacheDuration: number) {
    super({}, cacheDuration)
  }

  async fetchPackage(request: PackageRequest<ComposerConfig>): Promise<PackageDocument> {
    const semverSpec = VersionHelpers.parseSemver(request.package.version);
    const url = `${request.clientData.getApiUrl()}/${request.package.name}.json`;

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
  request: PackageRequest<ComposerConfig>,
  semverSpec: SemverSpec
): Promise<PackageDocument> {

  return client.requestJson(HttpRequestMethods.get, url, {})
    .then((httpResponse: JsonClientResponse) => {
      const packageInfo = httpResponse.data.packages[request.package.name];

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


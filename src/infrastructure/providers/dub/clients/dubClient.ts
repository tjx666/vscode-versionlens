import { ILogger } from "core/logging";
import {
  HttpClientResponse,
  HttpClientRequestMethods,
  HttpRequestOptions
} from "core/clients";
import {
  DocumentFactory,
  ResponseFactory,
  SuggestionFactory,
  VersionHelpers,
  PackageSourceTypes,
  PackageDocument,
  SemverSpec,
  PackageRequest,
  IPackageClient,
  PackageVersionStatus,
  PackageSuggestion,
} from "core/packages";

import { JsonHttpClientRequest, } from 'infrastructure/clients';
import { DubConfig } from '../dubConfig';

export class DubClient
  extends JsonHttpClientRequest
  implements IPackageClient<null> {

  config: DubConfig;

  constructor(config: DubConfig, options: HttpRequestOptions, logger: ILogger) {
    super(logger, options, {});
    this.config = config;
  }

  async fetchPackage(request: PackageRequest<null>): Promise<PackageDocument> {
    const semverSpec = VersionHelpers.parseSemver(request.package.version);
    const url = `${this.config.apiUrl}/${encodeURIComponent(request.package.name)}/info`;

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

  const queryParams = {
    minimize: 'true',
  }

  return client.requestJson(HttpClientRequestMethods.get, url, queryParams)
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
      const suggestions = createSuggestionTags(
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

export function createSuggestionTags(
  versionRange: string,
  releases: string[],
  prereleases: string[]
): Array<PackageSuggestion> {

  const suggestions = SuggestionFactory.createSuggestionTags(
    versionRange,
    releases,
    prereleases
  );

  // check for ~{name} suggestion if no matches found
  const firstSuggestion = suggestions[0];
  const hasNoMatch = firstSuggestion.name === PackageVersionStatus.NoMatch;
  const isTildeVersion = versionRange.charAt(0) === '~';

  if (hasNoMatch && isTildeVersion && releases.length > 0) {
    const latestRelease = releases[releases.length - 1];

    if (latestRelease === versionRange) {
      suggestions[0] = SuggestionFactory.createMatchesLatest(versionRange);
      suggestions.pop();
    } else {
      // suggest
      suggestions[1] = SuggestionFactory.createLatest(latestRelease);
    }

  }

  return suggestions;
}

export async function readDubSelections(filePath) {

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
      if (selectionsJson.fileVersion != 1) {
        reject(new Error(`Unknown dub.selections.json file version ${selectionsJson.fileVersion}`))
        return;
      }

      resolve(selectionsJson);
    });

  });

}
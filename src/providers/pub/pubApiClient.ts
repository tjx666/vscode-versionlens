import {
  PackageRequest,
  PackageIdentifier,
  DocumentFactory,
  ResponseFactory,
  PackageDocument,
  PackageSourceTypes,
  SuggestionFactory,
  VersionHelpers,
  SemverSpec
} from 'core/packages';

import {
  JsonHttpRequest,
  HttpRequestMethods,
  HttpResponse
} from "core/clients";

import PubConfig from './config';

const jsonRequest = new JsonHttpRequest({}, 0);

export async function fetchPubPackage(request: PackageRequest): Promise<PackageDocument> {
  const semverSpec = VersionHelpers.parseSemver(request.package.version);

  return createRemotePackageDocument(request, semverSpec)
    .catch((error: HttpResponse) => {
      if (error.status === 404) {
        return DocumentFactory.createNotFound(
          PubConfig.provider,
          request.package,
          null,
          ResponseFactory.createResponseStatus(error.source, error.status)
        );
      }
      return Promise.reject(error);
    });
}

function createRemotePackageDocument(request: PackageRequest, semverSpec: SemverSpec): Promise<PackageDocument> {

  const url = `${PubConfig.getApiUrl()}/api/documentation/${request.package.name}`;

  return jsonRequest.requestJson(HttpRequestMethods.get, url)
    .then(httpResponse => {

      const packageInfo = httpResponse.data;

      const versionRange = semverSpec.rawVersion;

      const requested: PackageIdentifier = request.package;

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
        provider: PubConfig.provider,
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
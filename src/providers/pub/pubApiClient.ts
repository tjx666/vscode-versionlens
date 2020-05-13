import { PackageRequest, PackageIdentifier } from "core/packages/models/packageRequest";
import * as DocumentFactory from 'core/packages/factories/packageDocumentFactory';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { PackageDocument, PackageSourceTypes } from "core/packages/models/packageDocument";
import { createSuggestionTags } from 'core/packages/factories/packageSuggestionFactory';
import { splitReleasesFromArray, extractVersionsFromMap, parseSemver } from 'core/packages/helpers/versionHelpers';
import { SemverSpec } from 'core/packages/definitions/semverSpec';
import {
  JsonHttpRequest,
  HttpRequestMethods,
  HttpResponse
} from "core/clients";

import PubConfig from './config';

const jsonRequest = new JsonHttpRequest({}, 0);

export async function fetchPubPackage(request: PackageRequest): Promise<PackageDocument> {
  const semverSpec = parseSemver(request.package.version);

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

      const rawVersions = extractVersionsFromMap(packageInfo.versions);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = splitReleasesFromArray(rawVersions)

      // analyse suggestions
      const suggestions = createSuggestionTags(versionRange, releases, prereleases);

      // todo return a ~master entry when no matches found
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
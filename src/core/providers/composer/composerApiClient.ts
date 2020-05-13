import * as DocumentFactory from 'core/packages/factories/packageDocumentFactory';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { PackageRequest } from "core/packages/models/packageRequest";
import { PackageDocument, PackageSourceTypes } from 'core/packages/models/packageDocument';
import { createSuggestionTags } from 'core/packages/factories/packageSuggestionFactory';
import {
  splitReleasesFromArray,
  parseSemver,
  filterSemverVersions,
} from 'core/packages/helpers/versionHelpers';
import { SemverSpec } from "core/packages/definitions/semverSpec";
import { HttpResponse, HttpRequestMethods } from 'core/clients/requests/httpRequest';
import { JsonHttpRequest } from 'core/clients/requests/jsonHttpRequest';
import ComposerConfig from './config';

const jsonRequest = new JsonHttpRequest({}, undefined);
const fs = require('fs');

export async function fetchComposerPackage(request: PackageRequest): Promise<PackageDocument> {
  const semverSpec = parseSemver(request.package.version);

  return createRemotePackageDocument(request, semverSpec)
    .catch((error: HttpResponse) => {
      if (error.status === 404) {
        return DocumentFactory.createNotFound(
          ComposerConfig.provider,
          request.package,
          null
        );
      }
      return Promise.reject(error);
    });
}

export async function createRemotePackageDocument(request: PackageRequest, semverSpec: SemverSpec): Promise<PackageDocument> {
  const url = `${ComposerConfig.getApiUrl()}/${request.package.name}.json`;

  return jsonRequest.requestJson(HttpRequestMethods.get, url)
    .then(httpResponse => {
      const packageInfo = httpResponse.data.packages[request.package.name];

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
      const semverVersions = filterSemverVersions(rawVersions);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = splitReleasesFromArray(filterSemverVersions(semverVersions))

      // analyse suggestions
      const suggestions = createSuggestionTags(versionRange, releases, prereleases);

      return {
        provider: ComposerConfig.provider,
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


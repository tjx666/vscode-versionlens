import * as ErrorFactory from 'core/clients/errors/factory';
import * as PackageDocumentFactory from 'core/packages/factories/packageDocumentFactory';
import { FetchRequest } from 'core/clients/models/fetch';
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
import ComposerConfig from './config'

const jsonRequest = new JsonHttpRequest({}, 0);
const fs = require('fs');

export async function fetchPackage(request: FetchRequest): Promise<PackageDocument> {
  const semverSpec = parseSemver(request.packageVersion);

  return createRemotePackageDocument(request, semverSpec)
    .catch((error: HttpResponse) => {
      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      if (error.status === 404) {
        return PackageDocumentFactory.createNotFound(ComposerConfig.provider, requested, null);
      }

      return Promise.reject(ErrorFactory.createFetchError(request, error, semverSpec))
    });
}

export async function createRemotePackageDocument(request: FetchRequest, semverSpec: SemverSpec): Promise<PackageDocument> {
  const url = `${ComposerConfig.getApiUrl()}/${request.packageName}.json`;

  return jsonRequest.requestJson(HttpRequestMethods.get, url)
    .then(response => {
      const packageInfo = response.data.packages[request.packageName];

      const versionRange = semverSpec.rawVersion;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      const resolved = {
        name: request.packageName,
        version: versionRange,
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


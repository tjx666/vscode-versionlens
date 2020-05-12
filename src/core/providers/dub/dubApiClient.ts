import * as ErrorFactory from 'core/clients/errors/factory';
import * as PackageDocumentFactory from 'core/packages/factories/packageDocumentFactory';
import { PackageSourceTypes, PackageDocument } from 'core/packages/models/packageDocument';
import { createSuggestionTags } from 'core/packages/factories/packageSuggestionFactory';
import {
  extractVersionsFromMap,
  splitReleasesFromArray,
  parseSemver,
} from 'core/packages/helpers/versionHelpers';
import { SemverSpec } from 'core/packages/definitions/semverSpec';
import { FetchRequest } from 'core/clients/models/fetch';
import { JsonHttpRequest } from 'core/clients/requests/jsonHttpRequest.js';
import { HttpResponse, HttpRequestMethods } from 'core/clients/requests/httpRequest';
import DubConfig from './config';

const fs = require('fs');

const jsonRequest = new JsonHttpRequest({}, 0);

export async function fetchPackage(request: FetchRequest): Promise<PackageDocument> {
  const semverSpec = parseSemver(request.packageVersion);
  return createRemotePackageDocument(request, semverSpec)
    .catch(function (error: HttpResponse) {
      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      if (error.status === 404) {
        return PackageDocumentFactory.createNotFound(DubConfig.provider, requested, null);
      }

      return Promise.reject(ErrorFactory.createFetchError(request, error, semverSpec))
    });

}

function createRemotePackageDocument(request: FetchRequest, semverSpec: SemverSpec): Promise<PackageDocument> {

  const url = `${DubConfig.getApiUrl()}/${encodeURIComponent(request.packageName)}/info`;
  const queryParams = {
    minimize: 'true',
  }

  return jsonRequest.requestJson(HttpRequestMethods.get, url, queryParams)
    .then(response => {

      const packageInfo = response.data;

      const versionRange = semverSpec.rawVersion;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      const resolved = {
        name: request.packageName,
        version: versionRange,
      };

      const rawVersions = extractVersionsFromMap(packageInfo.versions);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = splitReleasesFromArray(rawVersions)

      // analyse suggestions
      const suggestions = createSuggestionTags(versionRange, releases, prereleases);

      // todo return a ~master entry when no matches found

      return {
        provider: DubConfig.provider,
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

export function readDubSelections(filePath) {

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
      if (selectionsJson.fileVersion != 1) {
        reject(new Error(`Unknown dub.selections.json file version ${selectionsJson.fileVersion}`))
        return;
      }

      resolve(selectionsJson);
    });

  });

}
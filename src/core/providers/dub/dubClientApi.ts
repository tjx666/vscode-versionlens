import * as ErrorFactory from 'core/clients/errors/factory';
import * as PackageDocumentFactory from 'core/packages/factories/packageDocumentFactory';
import { PackageSourceTypes, PackageDocument } from 'core/packages/models/packageDocument';
import {
  extractVersionsFromMap,
  splitReleasesFromArray,
  createSuggestionTags,
  parseSemver
} from 'core/packages/helpers/versionHelpers';
import { SemverSpec } from 'core/packages/definitions/semverSpec';
import { FetchRequest } from 'core/clients/models/fetch';

const fs = require('fs');

const FEED_URL = 'https://code.dlang.org/api/packages';

export function fetchPackage(request: FetchRequest): Promise<PackageDocument> {
  const semverSpec: SemverSpec = parseSemver(request.packageVersion);

  const url = `${FEED_URL}/${encodeURIComponent(request.packageName)}/info?minimize=true`;
  const httpRequest = require('request-light');
  return httpRequest.xhr({ url })
    .then(response => {
      if (response.status != 200) {
        return Promise.reject(
          ErrorFactory.createFetchError(request, response, semverSpec)
        );
      }

      const packageInfo = JSON.parse(response.responseText);
      if (!packageInfo || packageInfo.versions.length === 0) {
        return Promise.reject({ semverSpec, reason: { status: 404 } });
      }

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

      // anaylse and report
      const tags = createSuggestionTags(versionRange, releases, prereleases);

      // todo return a ~master entry when no matches found

      return {
        provider: 'dub',
        source: PackageSourceTypes.registry,
        type: semverSpec.type,
        requested,
        resolved,
        releases,
        prereleases,
        tags,
      };
    })
    .catch(error => {
      const { response } = error;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      if (error.status === 404 || response?.status === 404) {
        return PackageDocumentFactory.createNotFound('composer', requested, null);
      }

      if (!response) {
        return Promise.reject(ErrorFactory.createFetchError(request, error, semverSpec))
      }

      return Promise.reject(error);
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
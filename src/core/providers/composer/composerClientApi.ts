import * as ErrorFactory from 'core/clients/errors/factory';
import * as PackageDocumentFactory from 'core/packages/factories/packageDocumentFactory';
import { FetchRequest } from 'core/clients/model/fetch';
import { PackageDocument, PackageSourceTypes } from "core/packages/models/packageDocument";
import {
  splitReleasesFromArray,
  createVersionTags,
  parseSemver
} from "core/packages/helpers/versionHelpers";
import { SemverSpec } from "core/packages/definitions/semverSpec";

const fs = require('fs');
const FEED_URL = 'https://repo.packagist.org/p';

export async function fetchPackage(request: FetchRequest): Promise<PackageDocument> {
  const semverSpec: SemverSpec = parseSemver(request.packageVersion);

  const httpRequest = require('request-light');
  const url = `${FEED_URL}/${request.packageName}.json`;
  return httpRequest.xhr({ url })
    .then(response => {
      if (response.status != 200) {
        return Promise.reject(ErrorFactory.createFetchError(request, response, semverSpec));
      }

      const data = JSON.parse(response.responseText);
      if (!data) return Promise.reject(ErrorFactory.createFetchError(request, { responseText: '', status: 404 }, semverSpec));

      const packageInfo = data.packages[request.packageName];

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

      // seperate versions to releases and prereleases
      const { releases, prereleases } = splitReleasesFromArray(pluckSemverVersions(rawVersions))

      // anaylse and report
      const tags = createVersionTags(versionRange, releases, prereleases);

      return {
        provider: 'composer',
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
        return Promise.reject(ErrorFactory.createFetchError(request, error, null))
      }

      return Promise.reject(error);
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


export function pluckSemverVersions(versions: Array<string>): Array<string> {
  const { validRange } = require('semver');
  const semverVersions = [];
  versions.forEach(version => {
    if (validRange(version)) semverVersions.push(version);
  });
  return semverVersions;
}
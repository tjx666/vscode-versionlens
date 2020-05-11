import { PackageSourceTypes, PackageVersionTypes, PackageDocument } from 'core/packages/models/packageDocument';
import { extractVersions, splitReleasesFromArray, createVersionTags } from 'core/packages/helpers/versionHelpers';

const fs = require('fs');

const FEED_URL = 'https://code.dlang.org/api/packages';

export function fetchPackage(packagePath: string, packageName: string, packageVersion: string): Promise<PackageDocument> {
  const { valid, validRange } = require('semver');
  const isVersion = valid(packageVersion);
  const isRange = validRange(packageVersion);
  const dubSpec = {
    rawVersion: packageVersion,
    type: !!isVersion ?
      PackageVersionTypes.version :
      !!isRange ? PackageVersionTypes.range :
        null,
  }

  const url = `${FEED_URL}/${encodeURIComponent(packageName)}/info?minimize=true`;
  const httpRequest = require('request-light');
  return httpRequest.xhr({ url })
    .then(response => {
      if (response.status != 200) {
        return Promise.reject({
          status: response.status,
          responseText: response.responseText
        });
      }

      const packageInfo = JSON.parse(response.responseText);
      if (!packageInfo || packageInfo.versions.length === 0) {
        return Promise.reject({ status: 404 });
      }

      const versionRange = dubSpec.rawVersion;

      const requested = {
        name: packageName,
        version: packageVersion
      };

      const resolved = {
        name: packageName,
        version: versionRange,
      };

      const rawVersions = extractVersions(packageInfo.versions).filter(version => version !== '~master');

      // seperate versions to releases and prereleases
      const { releases, prereleases } = splitReleasesFromArray(rawVersions)

      // anaylse and report
      const tags = createVersionTags(versionRange, releases, prereleases);

      return {
        provider: 'dub',
        source: PackageSourceTypes.registry,
        type: dubSpec.type,
        requested,
        resolved,
        releases,
        prereleases,
        tags,
      };
    })
    .catch(reason => Promise.reject({ reason, dubSpec }));
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
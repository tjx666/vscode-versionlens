/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as npm from 'npm';
import * as npa from 'npm-package-arg';
import * as semver from 'semver';
import * as path from 'path';
import * as fs from 'fs';

export function npmPackageDirExists(packageJsonPath, packageName) {
  npm.localPrefix = packageJsonPath;
  const npmFormattedPath = path.join(npm.dir, packageName);
  return fs.existsSync(npmFormattedPath);
}

export function npmViewVersion(packageName) {
  return new Promise((resolve, reject) => {
    npm.load(loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }

      npm.view(packageName, 'version', (viewError, response) => {
        if (viewError) {
          reject(viewError);
          return;
        }

        // get the keys from the object returned
        let keys = Object.keys(response);

        // ensure the version keys are semver sorted
        keys.sort((a, b) => {
          if (semver.gt(a, b))
            return 1;
          else if (semver.lt(a, b))
            return -1;

          return 0;
        });

        // take the last and most recent version key
        let lastKey = keys.length > 0 ? keys[keys.length - 1] : null;

        resolve(lastKey);
      });
    });
  });
}

export function npmViewDistTags(packageName) {
  return new Promise((resolve, reject) => {
    npm.load(loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }

      npm.view(packageName, 'dist-tags', (viewError, response) => {
        if (viewError) {
          reject(viewError);
          return;
        }

        // get the keys from the object returned
        let keys = Object.keys(response);

        // take the first key and return the dist-tags keys
        let tags
        if (keys.length > 0) {
          const distTags = response[keys[0]]['dist-tags'];
          tags = Object.keys(distTags)
            .map(key => ({ name: key, version: distTags[key] }));
        } else {
          tags = [
            { name: key, version: "latest" }
          ];
        }

        // fixes a case where npm doesn't publish latest as the first dist-tags
        const latestIndex = tags.findIndex(item => item.name === 'latest');
        if (latestIndex > 0) {
          // extract the entry
          const latestEntry = tags.splice(latestIndex, 1);
          // re insert the entry at the start
          tags.splice(0, 0, latestEntry[0]);
        }

        resolve(tags);
      });
    });
  });
}

export function npmGetOutdated(npmLocalPath) {
  return new Promise((resolve, reject) => {
    npm.load(loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }

      npm.localPrefix = npmLocalPath;
      npm.config.set('json', true);
      npm.outdated((err, response) => {
        if (err) {
          reject(err);
          return;
        }

        const outdated = parseOutdatedResponse(response);
        resolve(outdated);
      });
    });
  });
}

export function npmViewVersions(packageName) {
  return new Promise((resolve, reject) => {
    npm.load(loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }

      npm.view(packageName, 'versions', (viewError, response) => {
        if (viewError) {
          reject(viewError);
          return;
        }

        // get the keys from the object returned
        let keys = Object.keys(response);
        let firstKey = keys[0];
        resolve(response[firstKey].versions);
      });
    });
  });
}

export function parseNpmVersion(packageName, packageVersion) {
  return new Promise(function (resolve, reject) {
    try {
      const npaParsed = npa.resolve(packageName, packageVersion);
      resolve(npaParsed);
    } catch (err) {
      reject(err);
    }
  });
}


function parseOutdatedResponse(response) {
  let outdated = [];
  if (response.length > 0) {
    outdated = response.map(
      entry => ({
        path: entry[0],
        name: entry[1],
        current: entry[2],
        willInstall: entry[3],
        latest: entry[4],
        wanted: entry[5]
      })
    );
  }
  return outdated;
}
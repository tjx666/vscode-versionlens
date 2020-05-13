const path = require('path');

export function npmPackageDirExists(packageJsonPath, packageName) {
  const fs = require('fs');
  const npm = require('npm');
  const npmFormattedPath = path.join(npm.dir, packageName);

  npm.localPrefix = packageJsonPath;
  return fs.existsSync(npmFormattedPath);
}

export function npmGetOutdated(packagePath) {
  const npm = require('npm');
  
  return new Promise((resolve, reject) => {
    npm.load({ prefix: packagePath }, loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }

      npm.config.set('json', true);
      const silent = true;
      npm.commands.outdated(silent, (err, response) => {
        if (err) {
          if (err.code !== 'ETARGET') {
            reject(err);
            return;
          }
          response = "";
        }

        const outdatedResult = parseOutdatedResponse(response);
        resolve(outdatedResult);
      });
    });
  });
}

export function parseNpmArguments(packagePath, packageName, packageVersion) {
  const npa = require('npm-package-arg');

  return new Promise(function (resolve, reject) {
    try {
      const npaParsed = npa.resolve(packageName, packageVersion, packagePath);
      if (!npaParsed) {
        reject({ code: 'EUNSUPPORTEDPROTOCOL' });
        return;
      }

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
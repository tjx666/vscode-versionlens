const fs = require('fs');
const semver = require('semver');
const FEED_URL = 'https://repo.packagist.org/p';

export function composerGetPackageLatest(packageName) {
  const httpRequest = require('request-light');

  const queryUrl = `${FEED_URL}/${packageName}.json`;
  return new Promise(function (resolve, reject) {
    httpRequest.xhr({ url: queryUrl })
      .then(response => {
        if (response.status != 200) {
          reject({
            status: response.status,
            responseText: response.responseText
          });
          return;
        }

        const versionStr = JSON.parse(response.responseText);

        // get the keys from the object returned
        let keys = Object.keys(versionStr.packages[packageName]);

        // ensure the version keys are semver sorted
        keys.sort((a, b) => {
          if (!semver.valid(a))
            return 0;
          if (!semver.valid(b))
            return 1;
          if (semver.gt(a, b))
            return 1;
          else if (semver.lt(a, b))
            return -1;

          return 0;
        });

        // take the last and most recent version key
        let lastKey = null;
        if (keys.length > 0)
          lastKey = keys[keys.length - 1];

        resolve(lastKey);
      })
      .catch(reject);
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

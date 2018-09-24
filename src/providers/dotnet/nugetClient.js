/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const FEED_URL = 'https://api-v2v3search-0.nuget.org/autocomplete';

export function nugetGetPackageVersions(packageName) {
  const httpRequest = require('request-light');
  const queryUrl = `${FEED_URL}?id=${packageName}&prerelease=true&semVerLevel=2.0.0`;

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

        const pkg = JSON.parse(response.responseText);
        if (pkg.totalHits == 0)
          reject({ status: 404 });
        else
          resolve(pkg.data.reverse());
      }).catch(reject);
  });

}

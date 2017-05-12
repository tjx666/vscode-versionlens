/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as httpRequest from 'request-light';

// TODO allow for mutliple sources
const FEED_URL = 'https://api.nuget.org/v3-flatcontainer';

export function nugetGetPackageVersions(packageName) {

  const queryUrl = `${FEED_URL}/${packageName}/index.json`;
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
        resolve(pkg.versions.reverse());
      }).catch(reject);
  });

}


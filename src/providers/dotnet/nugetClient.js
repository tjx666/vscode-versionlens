/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appContrib from 'common/appContrib';

export function nugetGetPackageVersions(packageName) {
  const httpRequest = require('request-light');

  const promises = appContrib.dotnetNuGetFeeds.map(feed => {
    const queryUrl = `${feed}?id=${packageName}&prerelease=${appContrib.dotnetIncludePrerelease}&semVerLevel=2.0.0`;
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
  })


  // Invert resolve logic so that first item to resolve is thrown as rejection
  // More thorough explanation: https://stackoverflow.com/a/37235274/5364746
  // If 2 or more feeds contain same package but with different available version
  // this could cause issues and then it would require to fully resolve all feeds. 
  return Promise.all(promises.map(p => {
    return p.then(
      result => Promise.reject(result),
      error => Promise.resolve(error)
    );
  })).then(
    errors => Promise.reject(errors[0]),
    result => Promise.resolve(result)
  )
}
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const { workspace } = require('vscode');


export function nugetGetPackageVersions(packageName) {
  const httpRequest = require('request-light');
  const config = workspace.getConfiguration('versionlens.dotnet'); 
  const feedUrl = config.get('nugetFeed'); 
  const includePrelease = config.get('includePrerelease'); 
  const queryUrl = `${feedUrl}?id=${packageName}&prerelease=${includePrelease}&semVerLevel=2.0.0`;

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

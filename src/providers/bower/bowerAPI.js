/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const bower = require('bower');

export function bowerGetPackageInfo(packageName, localPath) {

  return new Promise(function (resolve, reject) {
    bower.commands.info(packageName, undefined, { cwd: localPath })
      .on('end', info => {
        if (!info || !info.latest) {
          reject({
            status: 404,
            responseText: `Invalid object returned from server for '${packageName}'`
          });
          return;
        }

        resolve(info);
      })
      .on('error', err => {
        reject({
          status: 500,
          responseText: err
        });
      });

  });

}
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const bower = require('bower');

export function bowerGetPackageInfo(packageName) {

  return new Promise(function (resolve, reject) {

    bower.commands.info(packageName)
      .on('end', info => {
        if (!info || !info.latest) {
          reject({
            status: 404,
            responseText: 'Invalid object returned from server'
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
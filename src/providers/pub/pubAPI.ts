/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { pubRequest } from "../../common/pubRequest";

export function pubGetPackageInfo(packageName) {
  return new Promise(function(resolve, reject) {
    pubRequest
      .httpGet(packageName)
      .then(info => {
        if (!info || !info.latestStableVersion) {
          reject({
            status: 404,
            responseText: `Invalid object returned from server for '${packageName}'`
          });
          return;
        }

        resolve(info);
      })
      .catch(err => {
        reject({
          status: 500,
          responseText: err
        });
      });
  });
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as npm from 'npm';

export function NpmViewVersion(packageName) {
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

        // take the last and most recent version key
        let lastKey = keys.length > 0 ? keys[keys.length - 1] : '';

        resolve(lastKey);
      });
    });
  });
}

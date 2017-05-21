/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { PackageCodeLens } from '../common/packageCodeLens';
import appSettings from '../common/appSettings';

export class AbstractCodeLensProvider {

  resolveCodeLens(codeLens, token) {
    if (codeLens instanceof PackageCodeLens) {
      // set in progress 
      appSettings.inProgress = true;

      // evaluate the code lens
      const evaluated = this.evaluateCodeLens(codeLens);

      // update the progress 
      if (evaluated instanceof Promise) {
        evaluated.then(result => {
          appSettings.inProgress = false;
          return result;
        })
      } else
        appSettings.inProgress = false;

      // return evaluated codelens
      return evaluated;
    }
  }

}
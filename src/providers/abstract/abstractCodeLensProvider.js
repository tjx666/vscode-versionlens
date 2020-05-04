/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from 'common/appSettings';
import { PackageCodeLens } from 'providers/shared/packageCodeLens';

export class AbstractCodeLensProvider {

  constructor() {
    const { EventEmitter } = require('vscode');
    this._onChangeCodeLensesEmitter = new EventEmitter();
    this.onDidChangeCodeLenses = this._onChangeCodeLensesEmitter.event;
  }

  reload() {
    this._onChangeCodeLensesEmitter.fire();
  }

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
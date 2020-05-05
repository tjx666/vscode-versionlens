/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/// <reference path="../../../node_modules/@types/vscode/index.d.ts" />

import appSettings from '../../appSettings';
import { PackageCodeLens } from '../shared/packageCodeLens';
import { IPackageCodeLens } from '../shared/definitions';
import { EventEmitter, CancellationToken } from 'vscode';

export abstract class AbstractCodeLensProvider  {

  _onChangeCodeLensesEmitter: EventEmitter<void>;
  onDidChangeCodeLenses: any;

  constructor() {
    const { EventEmitter } = require('vscode');
    this._onChangeCodeLensesEmitter = new EventEmitter();
    this.onDidChangeCodeLenses = this._onChangeCodeLensesEmitter.event;
  }

  reload() {
    this._onChangeCodeLensesEmitter.fire();
  }

  abstract evaluateCodeLens(codeLens: IPackageCodeLens, token: CancellationToken);

  resolveCodeLens(codeLens: IPackageCodeLens, token: CancellationToken) {
    if (codeLens instanceof PackageCodeLens) {

      // set in progress
      appSettings.inProgress = true;

      // evaluate the code lens
      const evaluated = this.evaluateCodeLens(codeLens, token);

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
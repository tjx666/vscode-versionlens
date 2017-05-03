/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class AbstractCodeLensProvider {

  constructor() {
    this._disposables = [];
  }

  dispose() {
    while (this._disposables.length > 0) {
      this._disposables.pop().dispose();
    }
  }

}
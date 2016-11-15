/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from '../common/di';
import { assertInstanceOf } from '../common/typeAssertion';
import { AppConfiguration } from '../common/appConfiguration';

const VersionRegex = /^(?:[^0-9]*)?(.*)$/;

@inject('semver', 'appConfig', 'commandFactory')
export abstract class AbstractCodeLensProvider {

  constructor() {
    this._disposables = [];
  }

  dispose() {
    while (this._disposables.length > 0) {
      this._disposables.pop().dispose();
    }
  }

  collectDependencies_(collector, rootNode, customVersionParser) {
    rootNode.getChildNodes()
      .forEach(node => {
        const testDepProperty = node.key.value;
        if (this.packageDependencyKeys.includes(testDepProperty))
          collector.addRange(node.value.getChildNodes(), customVersionParser);
      });
  }

}
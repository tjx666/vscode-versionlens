/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from '../common/di';
import { assertInstanceOf } from '../common/typeAssertion';
import { AppConfiguration } from '../common/appConfiguration';

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
      .forEach(childNode => {
        if (this.getPackageDependencyKeys().includes(childNode.key.value) == false)
          return;

        const childDeps = childNode.value.getChildNodes();
        // check if this node has entries and if so add the update all command
        if (childDeps.length > 0)
          this.commandFactory.makeUpdateDependenciesCommand(
            childNode.key.value,
            collector.addNode(childNode),
            collector.collection
          );

        // collect all child dependencies
        collector.addDependencyNodeRange(childDeps, customVersionParser);
      });
  }

}
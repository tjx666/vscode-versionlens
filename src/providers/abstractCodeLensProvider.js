/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from '../common/di';
import { assertInstanceOf } from '../common/typeAssertion';
import { AppConfiguration } from '../common/appConfiguration';

const VersionRegex = /^(?:[^0-9]*)?(.*)$/;

@inject('semver')
export abstract class AbstractCodeLensProvider {

  constructor(appConfig) {
    assertInstanceOf(
      appConfig,
      AppConfiguration,
      "AbstractCodeLensProvider: appConfig parameter is invalid"
    );
    this._disposables = [];
    this.appConfig = appConfig;
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

  makeErrorCommand(errorMsg, codeLensItem) {
    codeLensItem.command = {
      title: `${errorMsg}`,
      command: undefined,
      arguments: undefined
    };
    return codeLensItem;
  }

  makeVersionCommand(localVersion, serverVersion, codeLensItem) {
    const isLocalValid = this.semver.valid(localVersion);
    const isLocalValidRange = this.semver.validRange(localVersion);
    const isServerValid = this.semver.valid(serverVersion);
    const isServerValidRange = this.semver.validRange(serverVersion);

    if (!isLocalValid && !isLocalValidRange && localVersion !== 'latest')
      return this.makeErrorCommand("Invalid semver version entered", codeLensItem);

    if (!isServerValid && !isServerValidRange && serverVersion !== 'latest')
      return this.makeErrorCommand("Invalid semver server version received, " + serverVersion, codeLensItem);

    if (localVersion === 'latest')
      return this.makeLatestCommand(codeLensItem);

    if (isLocalValidRange && !isLocalValid) {
      if (this.semver.satisfies(serverVersion, localVersion)) {
        try {
          let m = VersionRegex.exec(localVersion);
          let cleanLocalVersion = (m && m[1]) || this.semver.clean(localVersion) || localVersion;
          if (cleanLocalVersion && this.semver.eq(serverVersion, cleanLocalVersion)) {
            return this.makeSatisfiedCommand(serverVersion, codeLensItem);
          }
        } catch (ex) {
          return this.makeSatisfiedCommand(serverVersion, codeLensItem);
        }
        return this.makeSatisfiedWithNewerCommand(serverVersion, codeLensItem);
      }
      else
        return this.makeNewVersionCommand(serverVersion, codeLensItem)
    }

    const hasNewerVersion = this.semver.gt(serverVersion, localVersion) === true
      || this.semver.lt(serverVersion, localVersion) === true;

    if (serverVersion !== localVersion && hasNewerVersion)
      return this.makeNewVersionCommand(serverVersion, codeLensItem)

    return this.makeLatestCommand(codeLensItem);
  }

  makeNewVersionCommand(newerVersion, codeLensItem) {
    const prefix = this.appConfig.versionPrefix;
    let replaceWithVersion = codeLensItem.toVersion(newerVersion);
    if (!replaceWithVersion.startsWith(prefix)) {
      replaceWithVersion = `${prefix}${replaceWithVersion}`
    }

    codeLensItem.command = {
      title: `${this.appConfig.updateIndicator} ${this.appConfig.versionPrefix}${newerVersion}`,
      command: `_${this.appConfig.extentionName}.updateDependencyCommand`,
      arguments: [
        codeLensItem,
        `"${replaceWithVersion}"`
      ]
    };
    return codeLensItem;
  }

  makeSatisfiedCommand(serverVersion, codeLensItem) {
    codeLensItem.command = {
      title: `satisfies v${serverVersion}`,
      command: undefined,
      arguments: undefined
    };
    return codeLensItem;
  }

  makeSatisfiedWithNewerCommand(serverVersion, codeLensItem) {
    const prefix = this.appConfig.versionPrefix;
    let replaceWithVersion = codeLensItem.toVersion(serverVersion);
    if (!replaceWithVersion.startsWith(prefix)) {
      replaceWithVersion = `${prefix}${replaceWithVersion}`
    }

    codeLensItem.command = {
      title: `${this.appConfig.updateIndicator} satisfies v${serverVersion}`,
      command: `_${this.appConfig.extentionName}.updateDependencyCommand`,
      arguments: [
        codeLensItem,
        `"${replaceWithVersion}"`
      ]
    };
    return codeLensItem;
  }

  makeLatestCommand(codeLensItem) {
    codeLensItem.command = {
      title: 'latest',
      command: undefined,
      arguments: undefined
    };
    return codeLensItem;
  }

  makeUpdateDependenciesCommand(codeLensItem) {
    codeLensItem.command = {
      title: `${this.appConfig.updateIndicator} Update all`,
      command: `_${this.appConfig.extentionName}.updateDependenciesCommand`,
      arguments: []
    };
    return codeLensItem;
  }

  makeDoMetaCommand(codeLensItem) {
    codeLensItem.command = {
      title: `${this.appConfig.openNewWindowIndicator} ` + (codeLensItem.commandMeta.type === 'file' ?
        codeLensItem.packageVersion :
        codeLensItem.commandMeta.uri),
      command: `_${this.appConfig.extentionName}.doMetaCommand`,
      arguments: [
        codeLensItem
      ]
    };
    return codeLensItem;
  }

}
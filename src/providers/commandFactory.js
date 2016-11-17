/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from '../common/di';
import { stripSymbolFromVersionRegex, semverLeadingChars } from '../common/utils';

@inject('semver', 'githubRequest', 'appConfig')
export class CommandFactory {

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
          let matches = stripSymbolFromVersionRegex.exec(localVersion);
          let cleanLocalVersion = (matches && matches[1]) || this.semver.clean(localVersion) || localVersion;
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

  makeNewVersionCommand(newVersion, codeLensItem) {
    const prefix = this.appConfig.versionPrefix;
    let replaceWithVersion = codeLensItem.generateNewVersion(newVersion);
    if (!replaceWithVersion.startsWith(prefix)) {
      replaceWithVersion = `${prefix}${replaceWithVersion}`
    }

    codeLensItem.command = {
      title: `${this.appConfig.updateIndicator} ${this.appConfig.versionPrefix}${newVersion}`,
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
    let replaceWithVersion = codeLensItem.generateNewVersion(serverVersion);
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

  makeTagCommand(tag, codeLensItem) {
    codeLensItem.command = {
      title: tag,
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

  makeLinkCommand(codeLensItem) {
    codeLensItem.command = {
      title: `${this.appConfig.openNewWindowIndicator} ` + (codeLensItem.package.meta.type === 'file' ?
        codeLensItem.package.version :
        codeLensItem.package.meta.remoteUrl),
      command: `_${this.appConfig.extentionName}.linkCommand`,
      arguments: [
        codeLensItem
      ]
    };
    return codeLensItem;
  }

  makeGithubCommand(codeLensItem) {
    const meta = codeLensItem.package.meta;

    return this.githubRequest[`getLatest${meta.category}`](meta.userRepo)
      .then(entry => {
        if (!entry)
          return this.makeTagCommand(`${meta.category}: none`, codeLensItem);

        if (meta.commitish === '' ||
          (semverLeadingChars.includes(meta.commitish[0]) ? meta.commitish[0] : '') + entry.version === meta.commitish)
          return this.makeTagCommand(`${meta.category}: latest`, codeLensItem);

        const newVersion = codeLensItem.generateNewVersion(entry.version);
        codeLensItem.command = {
          title: `${meta.category}: ${this.appConfig.updateIndicator} ${entry.version}`,
          command: `_${this.appConfig.extentionName}.updateDependencyCommand`,
          arguments: [
            codeLensItem,
            `"${newVersion}"`
          ]
        };
        return codeLensItem;
      })
      .catch(error => {
        if (error.rateLimitExceeded)
          return this.makeTagCommand(`Rate limit exceeded`, codeLensItem);

        return Promise.reject(error);
      });
  }

}
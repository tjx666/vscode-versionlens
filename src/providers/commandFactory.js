/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from '../common/di';
import { stripSymbolFromVersionRegex, semverLeadingChars } from '../common/utils';

@inject('fs', 'path', 'semver', 'githubRequest', 'appConfig')
export class CommandFactory {

  makeErrorCommand(errorMsg, codeLens) {
    return codeLens.setCommand(`${errorMsg}`);
  }

  makeVersionCommand(localVersion, serverVersion, codeLens) {
    const isLocalValid = this.semver.valid(localVersion);
    const isLocalValidRange = this.semver.validRange(localVersion);
    const isServerValid = this.semver.valid(serverVersion);
    const isServerValidRange = this.semver.validRange(serverVersion);

    if (!isLocalValid && !isLocalValidRange && localVersion !== 'latest')
      return this.makeErrorCommand("Invalid semver version entered", codeLens);

    if (!isServerValid && !isServerValidRange && serverVersion !== 'latest')
      return this.makeErrorCommand("Invalid semver server version received, " + serverVersion, codeLens);

    if (localVersion === 'latest')
      return this.makeLatestCommand(codeLens);

    if (isLocalValidRange && !isLocalValid) {
      if (this.semver.satisfies(serverVersion, localVersion)) {
        try {
          let matches = stripSymbolFromVersionRegex.exec(localVersion);
          let cleanLocalVersion = (matches && matches[1]) || this.semver.clean(localVersion) || localVersion;
          if (cleanLocalVersion && this.semver.eq(serverVersion, cleanLocalVersion)) {
            return this.makeSatisfiedCommand(serverVersion, codeLens);
          }
        } catch (ex) {
          return this.makeSatisfiedCommand(serverVersion, codeLens);
        }
        return this.makeSatisfiedWithNewerCommand(serverVersion, codeLens);
      }
      else
        return this.makeNewVersionCommand(serverVersion, codeLens)
    }

    const hasNewerVersion = this.semver.gt(serverVersion, localVersion) === true
      || this.semver.lt(serverVersion, localVersion) === true;

    if (serverVersion !== localVersion && hasNewerVersion)
      return this.makeNewVersionCommand(serverVersion, codeLens)

    return this.makeLatestCommand(codeLens);
  }

  makeNewVersionCommand(newVersion, codeLens) {
    const prefix = this.appConfig.versionPrefix;
    let replaceWithVersion = codeLens.generateNewVersion(newVersion);
    if (!replaceWithVersion.startsWith(prefix))
      replaceWithVersion = `${prefix}${replaceWithVersion}`

    return codeLens.setCommand(
      `${this.appConfig.updateIndicator} ${this.appConfig.versionPrefix}${newVersion}`,
      `_${this.appConfig.extentionName}.updateDependencyCommand`,
      [codeLens, `"${replaceWithVersion}"`]
    );
  }

  makeSatisfiedCommand(serverVersion, codeLens) {
    return codeLens.setCommand(`satisfies v${serverVersion}`);
  }

  makeSatisfiedWithNewerCommand(serverVersion, codeLens) {
    const prefix = this.appConfig.versionPrefix;
    let replaceWithVersion = codeLens.generateNewVersion(serverVersion);
    if (!replaceWithVersion.startsWith(prefix))
      replaceWithVersion = `${prefix}${replaceWithVersion}`

    return codeLens.setCommand(
      `${this.appConfig.updateIndicator} satisfies v${serverVersion}`,
      `_${this.appConfig.extentionName}.updateDependencyCommand`,
      [codeLens, `"${replaceWithVersion}"`]
    );
  }

  makeLatestCommand(codeLens) {
    return codeLens.setCommand('latest');
  }

  makeTagCommand(tag, codeLens) {
    return codeLens.setCommand(tag);
  }

  makeUpdateDependenciesCommand(propertyName, codeLens, codeLenCollection) {
    return codeLens.setCommand(
      `${this.appConfig.updateIndicator} Update ${propertyName}`,
      `_${this.appConfig.extentionName}.updateDependenciesCommand`,
      [codeLens, codeLenCollection]
    );
  }

  makeLinkCommand(codeLens) {
    const isFile = codeLens.package.meta.type === 'file';
    const title;
    const cmd = `_${this.appConfig.extentionName}.linkCommand`;

    if (isFile) {
      const filePath = this.path.resolve(this.path.dirname(codeLens.documentUrl.fsPath), codeLens.package.meta.remoteUrl);
      const fileExists = this.fs.existsSync(filePath);
      if(fileExists == false)
        title = (cmd = null) || 'Specified resource does not exist';
       else
        title = `${this.appConfig.openNewWindowIndicator} ${codeLens.package.version}`;
    } else
      title = `${this.appConfig.openNewWindowIndicator} ${codeLens.package.meta.remoteUrl}`;

    return codeLens.setCommand(title, cmd, [codeLens]);
  }

  makeGithubCommand(codeLens) {
    const meta = codeLens.package.meta;
    const fnName = `getLatest${meta.category}`;

    return this.githubRequest[fnName](meta.userRepo)
      .then(entry => {
        if (!entry)
          return this.makeTagCommand(`${meta.category}: none`, codeLens);

        if (meta.commitish === '' ||
          (semverLeadingChars.includes(meta.commitish[0]) ? meta.commitish[0] : '') + entry.version === meta.commitish)
          return this.makeTagCommand(`${meta.category}: latest`, codeLens);

        const newVersion = codeLens.generateNewVersion(entry.version);
        return codeLens.setCommand(
          `${meta.category}: ${this.appConfig.updateIndicator} ${entry.version}`,
          `_${this.appConfig.extentionName}.updateDependencyCommand`,
          [codeLens, `"${newVersion}"`]
        );
      })
      .catch(error => {
        if (error.rateLimitExceeded)
          return this.makeTagCommand('Rate limit exceeded', codeLens);

        if (error.notFound)
          return this.makeTagCommand('Resource not found', codeLens);

        return Promise.reject(error);
      });
  }

}
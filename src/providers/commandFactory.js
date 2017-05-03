/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as fs from 'fs';
import * as semver from 'semver';
import { stripSymbolFromVersionRegex, semverLeadingChars } from '../common/utils';
import { githubRequest } from '../common/githubRequest';
import { appGlobals } from '../common/appGlobals';

export function makeErrorCommand(errorMsg, codeLens) {
  return codeLens.setCommand(`${errorMsg}`);
}

export function makeVersionCommand(localVersion, serverVersion, codeLens) {
  const isLocalValid = semver.valid(localVersion);
  const isLocalValidRange = semver.validRange(localVersion);
  const isServerValid = semver.valid(serverVersion);
  const isServerValidRange = semver.validRange(serverVersion);

  if (!isLocalValid && !isLocalValidRange && localVersion !== 'latest')
    return makeErrorCommand("Invalid semver version entered", codeLens);

  if (!isServerValid && !isServerValidRange && serverVersion !== 'latest')
    return makeErrorCommand("Invalid semver server version received, " + serverVersion, codeLens);

  if (localVersion === 'latest')
    return makeLatestCommand(codeLens);

  if (isLocalValidRange && !isLocalValid) {
    if (semver.satisfies(serverVersion, localVersion)) {
      try {
        let matches = stripSymbolFromVersionRegex.exec(localVersion);
        let cleanLocalVersion = (matches && matches[1]) || semver.clean(localVersion) || localVersion;
        if (cleanLocalVersion && semver.eq(serverVersion, cleanLocalVersion)) {
          return makeSatisfiedCommand(serverVersion, codeLens);
        }
      } catch (ex) {
        return makeSatisfiedCommand(serverVersion, codeLens);
      }
      return makeSatisfiedWithNewerCommand(serverVersion, codeLens);
    }
    else
      return makeNewVersionCommand(serverVersion, codeLens)
  }

  const hasNewerVersion = semver.gt(serverVersion, localVersion) === true
    || semver.lt(serverVersion, localVersion) === true;

  if (serverVersion !== localVersion && hasNewerVersion)
    return makeNewVersionCommand(serverVersion, codeLens)

  return makeLatestCommand(codeLens);
}

export function makeNewVersionCommand(newVersion, codeLens) {
  const replaceWithVersion = codeLens.generateNewVersion(newVersion);
  return codeLens.setCommand(
    `${codeLens.getDistTagPrefix()}${appGlobals.updateIndicator} ${newVersion}`,
    `_${appGlobals.extentionName}.updateDependencyCommand`,
    [codeLens, `"${replaceWithVersion}"`]
  );
}

export function makeSatisfiedCommand(serverVersion, codeLens) {
  return codeLens.setCommand(`${codeLens.getDistTagPrefix()}Matches v${serverVersion}`);
}

export function makeSatisfiedWithNewerCommand(serverVersion, codeLens) {
  const replaceWithVersion = codeLens.generateNewVersion(serverVersion);
  return codeLens.setCommand(
    `${codeLens.getDistTagPrefix()}Matches ${appGlobals.updateIndicator} v${serverVersion}`,
    `_${appGlobals.extentionName}.updateDependencyCommand`,
    [codeLens, `"${replaceWithVersion}"`]
  );
}

export function makeLatestCommand(codeLens) {
  return codeLens.setCommand('Matches latest');
}

export function makeTagCommand(tag, codeLens) {
  return codeLens.setCommand(tag);
}

export function makeUpdateDependenciesCommand(propertyName, codeLens, codeLenCollection) {
  return codeLens.setCommand(
    `${codeLens.getDistTagPrefix()}${appGlobals.updateIndicator} Update ${propertyName}`,
    `_${appGlobals.extentionName}.updateDependenciesCommand`,
    [codeLens, codeLenCollection]
  );
}

export function makeLinkCommand(codeLens) {
  const isFile = codeLens.package.meta.type === 'file';
  const title;
  const cmd = `_${appGlobals.extentionName}.linkCommand`;

  if (isFile) {
    const filePath = path.resolve(path.dirname(codeLens.documentUrl.fsPath), codeLens.package.meta.remoteUrl);
    const fileExists = fs.existsSync(filePath);
    if (fileExists == false)
      title = (cmd = null) || 'Specified resource does not exist';
    else
      title = `${appGlobals.openNewWindowIndicator} ${codeLens.package.version}`;
  } else
    title = `${appGlobals.openNewWindowIndicator} ${codeLens.package.meta.remoteUrl}`;

  return codeLens.setCommand(title, cmd, [codeLens]);
}

export function makeGithubCommand(codeLens) {
  const meta = codeLens.package.meta;
  const fnName = `getLatest${meta.category}`;

  return githubRequest[fnName](meta.userRepo)
    .then(entry => {
      if (!entry)
        return makeTagCommand(`${meta.category}: none`, codeLens);

      if (meta.commitish === '' ||
        (semverLeadingChars.includes(meta.commitish[0]) ? meta.commitish[0] : '') + entry.version === meta.commitish)
        return makeTagCommand(`${meta.category}: latest`, codeLens);

      const newVersion = codeLens.generateNewVersion(entry.version);
      return codeLens.setCommand(
        `${meta.category}: ${appGlobals.updateIndicator} ${entry.version}`,
        `_${appGlobals.extentionName}.updateDependencyCommand`,
        [codeLens, `"${newVersion}"`]
      );
    })
    .catch(error => {
      if (error.rateLimitExceeded)
        return makeTagCommand('Rate limit exceeded', codeLens);

      if (error.notFound)
        return makeTagCommand('Resource not found', codeLens);

      if (error.badCredentials)
        return makeTagCommand('Bad credentials', codeLens);

      return Promise.reject(error);
    });
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as fs from 'fs';
import * as semver from 'semver';
import { stripSymbolFromVersionRegex, semverLeadingChars } from '../common/utils';
import { githubRequest } from '../common/githubRequest';
import appSettings from '../common/appSettings';

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

  if (isLocalValidRange && !isLocalValid) {

    if (!semver.satisfies(serverVersion, localVersion))
      return makeNewVersionCommand(serverVersion, codeLens);

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

  const hasNewerVersion = semver.gt(serverVersion, localVersion) === true
    || semver.lt(serverVersion, localVersion) === true;

  if (serverVersion !== localVersion && hasNewerVersion)
    return makeNewVersionCommand(serverVersion, codeLens);

  return makeLatestCommand(codeLens);
}

export function makeNewVersionCommand(newVersion, codeLens, prefix = '') {
  const replaceWithVersion = codeLens.generateNewVersion(newVersion);
  return codeLens.setCommand(
    `${codeLens.getTaggedVersionPrefix() || prefix}${appSettings.updateIndicator} ${newVersion}`,
    `${appSettings.extensionName}.updateDependencyCommand`,
    [codeLens, `"${replaceWithVersion}"`]
  );
}

export function makeSatisfiedCommand(serverVersion, codeLens) {
  return codeLens.setCommand(`Matches ${serverVersion}`);
}

export function makeSatisfiedWithNewerCommand(serverVersion, codeLens) {
  const replaceWithVersion = codeLens.generateNewVersion(serverVersion);
  return codeLens.setCommand(
    `Matches ${appSettings.updateIndicator} ${serverVersion}`,
    `${appSettings.extensionName}.updateDependencyCommand`,
    [codeLens, `"${replaceWithVersion}"`]
  );
}

export function makeLatestCommand(codeLens) {
  return codeLens.setCommand('Matches latest');
}

export function makeTagCommand(tag, codeLens) {
  return codeLens.setCommand(tag);
}

export function makeLinkCommand(codeLens) {
  const isFile = codeLens.package.meta.type === 'file';
  const title;
  const cmd = `${appSettings.extensionName}.linkCommand`;

  if (isFile) {
    const filePath = path.resolve(path.dirname(codeLens.documentUrl.fsPath), codeLens.package.meta.remoteUrl);
    const fileExists = fs.existsSync(filePath);
    if (fileExists == false)
      title = (cmd = null) || 'Specified resource does not exist';
    else
      title = `${appSettings.openNewWindowIndicator} ${codeLens.package.version}`;
  } else
    title = `${appSettings.openNewWindowIndicator} ${codeLens.package.meta.remoteUrl}`;

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
        `${meta.category}: ${appSettings.updateIndicator} ${entry.version}`,
        `${appSettings.extensionName}.updateDependencyCommand`,
        [codeLens, `"${newVersion}"`]
      );
    })
    .catch(error => {
      if (error.rateLimitExceeded)
        return makeTagCommand('Rate limit exceeded', codeLens);

      if (error.notFound)
        return makeTagCommand('Git resource not found', codeLens);

      if (error.badCredentials)
        return makeTagCommand('Bad credentials', codeLens);

      return Promise.reject(error);
    });
}

export function makeTaggedVersionCommand(codeLens) {
  const taggedVersion = codeLens.getTaggedVersion();
  const version = codeLens.package.version;

  // check for any leading semver symbols in the version
  // strip before compare if they exist
  const versionLeading = version && version[0];
  if (versionLeading && semverLeadingChars.includes(versionLeading))
    version = version.slice(1);

  if (version === taggedVersion)
    return makeTagCommand(`${codeLens.getTaggedVersionPrefix()} ${taggedVersion}`, codeLens);

  return makeNewVersionCommand(
    codeLens.getTaggedVersion(),
    codeLens
  );
}

export function makeFixedVersionCommand(codeLens) {
  const version = codeLens.package.meta.tag.version;
  if (!version)
    version = "invalid";

  return makeTagCommand(`Matches ${version}`, codeLens);
}

export function makeNotFoundCommand(codeLens) {
  return makeErrorCommand(
    `${codeLens.package.name} could not be found`,
    codeLens
  );
}
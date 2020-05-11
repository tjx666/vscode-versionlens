import { stripSymbolFromVersionRegex, semverLeadingChars } from '../../common/utils';
import { githubRequest } from 'core/clients/requests/githubRequest';
import appSettings from '../../appSettings';
import { PackageSuggestionFlags } from 'core/packages/models/packageDocument';

const semver = require('semver');

export function createErrorCommand(errorMsg, codeLens) {
  return codeLens.setCommand(`${errorMsg}`);
}

export function createVersionCommand(localVersion, serverVersion, codeLens) {
  const isLocalValid = semver.valid(localVersion);
  const isLocalValidRange = semver.validRange(localVersion);
  const isServerValid = semver.valid(serverVersion);
  const isServerValidRange = semver.validRange(serverVersion);

  if (!isLocalValid && !isLocalValidRange && localVersion !== 'latest')
    return createInvalidVersionCommand(codeLens);

  if (!isServerValid && !isServerValidRange && serverVersion !== 'latest')
    return createErrorCommand("Invalid semver server version received, " + serverVersion, codeLens);

  if (isLocalValidRange && !isLocalValid) {

    if (!semver.satisfies(serverVersion, localVersion))
      return createReplaceVersionCommand(serverVersion, codeLens);

    try {
      let matches = stripSymbolFromVersionRegex.exec(localVersion);
      let cleanLocalVersion = (matches && matches[1]) || semver.clean(localVersion) || localVersion;
      if (cleanLocalVersion && semver.eq(serverVersion, cleanLocalVersion)) {
        return createSatisfiesCommand(serverVersion, codeLens);
      }
    } catch (ex) {
      return createSatisfiesCommand(serverVersion, codeLens);
    }

    return createSatisfiedWithNewerCommand(serverVersion, codeLens);
  }

  const hasNewerVersion = semver.gt(serverVersion, localVersion) === true
    || semver.lt(serverVersion, localVersion) === true;

  if (serverVersion !== localVersion && hasNewerVersion)
    return createReplaceVersionCommand(serverVersion, codeLens);

  return createMatchesLatestVersionCommand(codeLens);
}

export function createReplaceVersionCommand(newVersion, codeLens) {
  const replaceWithVersion = codeLens.replaceVersionFn(newVersion);
  return codeLens.setCommand(
    `${appSettings.updateIndicator} ${newVersion}`,
    `${appSettings.extensionName}.updateDependencyCommand`,
    [codeLens, `${replaceWithVersion}`]
  );
}

export function createTagCommand(tag, codeLens) {
  return codeLens.setCommand(tag);
}

export function createRemoteLinkCommand(codeLens) {
  const cmd = `${appSettings.extensionName}.linkCommand`;
  const title = `${appSettings.openNewWindowIndicator} ${codeLens.package.meta.remoteUrl}`;
  return codeLens.setCommand(title, cmd, [codeLens]);
}

export function createDirectoryLinkCommand(codeLens) {
  let title;
  let cmd = `${appSettings.extensionName}.linkCommand`;
  const path = require('path');
  const fs = require('fs');
  const filePath = path.resolve(path.dirname(codeLens.documentUrl.fsPath), codeLens.package.tag.version);
  const fileExists = fs.existsSync(filePath);
  if (fileExists === false)
    title = (cmd = null) || 'Specified resource does not exist';
  else
    title = `${appSettings.openNewWindowIndicator} ${codeLens.package.requested.version}`;

  return codeLens.setCommand(title, cmd, [codeLens]);
}

export function createGithubCommand(codeLens) {
  const meta = codeLens.package.meta;
  const fnName = `getLatest${meta.category}`;

  return githubRequest[fnName](meta.userRepo)
    .then(entry => {
      if (!entry)
        return createTagCommand(`${meta.category}: none`, codeLens);

      if (meta.commitish === '' ||
        (semverLeadingChars.includes(meta.commitish[0]) ? meta.commitish[0] : '') + entry.version === meta.commitish)
        return createTagCommand(`${meta.category}: latest`, codeLens);

      const newVersion = codeLens.replaceVersionFn(entry.version);
      return codeLens.setCommand(
        `${meta.category}: ${codeLens.getInstallIndicator()} ${entry.version}`,
        `${appSettings.extensionName}.updateDependencyCommand`,
        [codeLens, `${newVersion}`]
      );
    })
    .catch(error => {
      if (error.rateLimitExceeded)
        return createTagCommand('Rate limit exceeded', codeLens);

      if (error.resourceNotFound)
        return createTagCommand('Git resource not found', codeLens);

      if (error.badCredentials)
        return createTagCommand('Bad credentials', codeLens);

      return Promise.reject(error);
    });
}

export function createTaggedVersionCommand(codeLens) {
  const { name, version, flags } = codeLens.package.tag;
  const isStatus = flags & PackageSuggestionFlags.status;
  const isPrerelease = flags & PackageSuggestionFlags.prerelease;
  const isTag = flags & PackageSuggestionFlags.tag;

  if (isStatus === false) {
    const replaceWithVersion = (isPrerelease || isTag) ? version : codeLens.replaceVersionFn(version);
    return codeLens.setCommand(
      `${name}: ${appSettings.updateIndicator} ${version}`,
      `${appSettings.extensionName}.updateDependencyCommand`,
      [codeLens, `${replaceWithVersion}`]
    );
  }

  // show the status
  return createTagCommand(`${name} ${version}`, codeLens);
}

export function createFixedVersionCommand(codeLens) {
  const version = codeLens.package.meta.tag.version;
  if (!version) return createInvalidVersionCommand(codeLens);

  return createTagCommand(`Fixed to ${version}`, codeLens);
}

export function createMatchesLatestVersionCommand(codeLens) {
  return createTagCommand('Latest', codeLens);
}

export function createSatisfiesLatestVersionCommand(codeLens) {
  return createTagCommand('Satisfies latest', codeLens);
}

export function createMatchesPrereleaseVersionCommand(codeLens) {
  return createTagCommand(`Prerelease ${codeLens.package.version}`, codeLens);
}

export function createInvalidVersionCommand(codeLens) {
  return createTagCommand(`Invalid version entered`, codeLens);
}

export function createPackageNotFoundCommand(codeLens) {
  return createErrorCommand(`${codeLens.package.name} could not be found`, codeLens);
}

export function createPackageUnexpectedError(codeLens) {
  // An error occurred retrieving this package.
  return createErrorCommand(
    `Unexpected error. See dev tools console`,
    codeLens
  );
}

export function createPackageMessageCommand(codeLens) {
  return createErrorCommand(
    `${codeLens.package.meta.message}`,
    codeLens
  );
}

export function createVersionMatchNotFoundCommand(codeLens) {
  return createErrorCommand(
    `Match not found: ${codeLens.package.version}`,
    codeLens
  );
}
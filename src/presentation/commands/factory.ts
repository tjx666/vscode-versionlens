import { stripSymbolFromVersionRegex, semverLeadingChars } from '../../common/utils';
import { githubRequest } from 'core/clients/requests/githubRequest';
import appSettings from '../../appSettings';
import { PackageSuggestionFlags } from 'core/packages/models/packageDocument';
import { VersionLens } from 'presentation/lenses/models/versionLens';

const semver = require('semver');

export function createErrorCommand(errorMsg, codeLens) {
  return codeLens.setCommand(`${errorMsg}`);
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

export function createSuggestedVersionCommand(codeLens: VersionLens) {
  const { name, version, flags } = codeLens.package.suggestion;
  const isStatus = flags & PackageSuggestionFlags.status;
  const isPrerelease = flags & PackageSuggestionFlags.prerelease;
  const isTag = flags & PackageSuggestionFlags.tag;

  if (!isStatus) {
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

export function createPackageNotFoundCommand(codeLens: VersionLens) {
  return createErrorCommand(`${codeLens.package.requested.name} could not be found`, codeLens);
}

export function createPackageUnexpectedError(codeLens: VersionLens) {
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
import {
  CommandContributions,
  SuggestionIndicators
} from 'presentation/extension';

import { PackageSuggestionFlags } from 'core/packages';
// import { githubRequest } from 'infrastructure/clients/githubClientRequest';
import { VersionLens } from 'presentation/lenses';

export function createErrorCommand(errorMsg, codeLens) {
  return codeLens.setCommand(`${errorMsg}`);
}

export function createTagCommand(tag, codeLens) {
  return codeLens.setCommand(tag);
}

// export function createRemoteLinkCommand(codeLens) {
//   const cmd = CommandContributions.LinkCommand;
//   const title = `${SuggestionIndicators.OpenNewWindow} ${codeLens.package.meta.remoteUrl}`;
//   return codeLens.setCommand(title, cmd, [codeLens]);
// }

export function createDirectoryLinkCommand(codeLens) {
  let title;
  let cmd = CommandContributions.LinkCommand;
  const path = require('path');
  const fs = require('fs');
  const filePath = path.resolve(path.dirname(codeLens.documentUrl.fsPath), codeLens.package.suggestion.version);
  const fileExists = fs.existsSync(filePath);
  if (fileExists === false)
    title = (cmd = null) || 'Specified resource does not exist';
  else
    title = `${SuggestionIndicators.OpenNewWindow} ${codeLens.package.requested.version}`;

  return codeLens.setCommand(title, cmd, [codeLens]);
}

// export function createGithubCommand(codeLens) {
//   const meta = codeLens.package.meta;
//   const fnName = `getLatest${meta.category}`;

//   return githubRequest[fnName](meta.userRepo)
//     .then(entry => {
//       if (!entry)
//         return createTagCommand(`${meta.category}: none`, codeLens);

//       if (meta.commitish === '' ||
//         (VersionHelpers.semverLeadingChars.includes(meta.commitish[0]) ? meta.commitish[0] : '') + entry.version === meta.commitish)
//         return createTagCommand(`${meta.category}: latest`, codeLens);

//       const newVersion = codeLens.replaceVersionFn(entry.version);
//       return codeLens.setCommand(
//         `${meta.category}: ${codeLens.getInstallIndicator()} ${entry.version}`,
//         CommandContributions.UpdateDependencyCommand,
//         [codeLens, `${newVersion}`]
//       );
//     })
//     .catch(error => {
//       if (error.rateLimitExceeded)
//         return createTagCommand('Rate limit exceeded', codeLens);

//       if (error.resourceNotFound)
//         return createTagCommand('Git resource not found', codeLens);

//       if (error.badCredentials)
//         return createTagCommand('Bad credentials', codeLens);

//       return Promise.reject(error);
//     });
// }

export function createSuggestedVersionCommand(codeLens: VersionLens) {
  const { name, version, flags } = codeLens.package.suggestion;
  const isStatus = (flags & PackageSuggestionFlags.status);
  const isTag = (flags & PackageSuggestionFlags.tag);
  const isPrerelease = flags & PackageSuggestionFlags.prerelease;

  if (!isStatus) {
    const replaceWithVersion: string = isPrerelease || isTag ?
      version :
      codeLens.replaceVersionFn(version);

    const prefix = isTag ? '' : name + ': ';
    return codeLens.setCommand(

      `${prefix}${SuggestionIndicators.Update} ${version}`,
      CommandContributions.UpdateDependencyCommand,
      [codeLens, `${replaceWithVersion}`]
    );
  }

  // show the status
  return createTagCommand(`${name} ${version}`.trimEnd(), codeLens);
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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { formatWithExistingLeading } from '../../../common/utils';
import { logErrorToConsole } from '../../../providers/shared/utils';
import { ReplaceVersionFunction } from '../../lenses/definitions/packageLens';
import * as PackageLensFactory from '../../lenses/factories/packageLensFactory';
import { PackageSourceTypes, PackageDocument, PackageVersionTypes } from 'core/packages/models/packageDocument';
import { ExpiryCacheMap } from 'core/caching/expiryCacheMap';
import { fetchPackage } from 'core/providers/npm/pacoteClientApi'

const cache = new ExpiryCacheMap();

export function resolveNpmPackage(packagePath: string, name: string, requestedVersion: string, replaceVersionFn: ReplaceVersionFunction): Promise<PackageDocument> {

  const cacheKey = `resolveNpmPackage_${name}@${requestedVersion}_${packagePath}`;
  // if (cache.hasExpired(cacheKey) === false) {
  //   return Promise.resolve(cache.get(cacheKey));
  // }

  return fetchPackage(packagePath, name, requestedVersion)
    .then(pack => {
      let replaceFn: ReplaceVersionFunction;
      if (replaceVersionFn === null) {
        replaceFn = (pack.source === PackageSourceTypes.git) ?
          npmReplaceVersion :
          pack.type === PackageVersionTypes.alias ?
            customNpmAliasedReplaceVersion :
            null;
      }

      // must be a registry version
      return PackageLensFactory.createPackageLens(pack, replaceFn);
    })
    .then(pack => {
      return cache.set(cacheKey, pack);
    })
    .catch(result => {
      const { npaResult, reason } = result;

      // if (reason.code === 'E404') {
      //   return PackageLensFactory.createPackageNotFound(name, requestedVersion, 'npm');
      // }

      // if (reason.code === 'EUNSUPPORTEDPROTOCOL') {
      //   return PackageLensFactory.createPackageNotSupported(name, requestedVersion, 'npm');
      // }

      // if (reason.code === 'EINVALIDTAGNAME' || reason.message.includes('Invalid comparator:')) {
      //   return PackageLensFactory.createInvalidVersion(name, requestedVersion, 'npm');
      // }

      // if (reason.code === 128 && npaResult.type === 'git') {
      //   return PackageLensFactory.createGitFailed(npaResult.rawSpec, reason.message, 'npm');
      // }

      logErrorToConsole("NPM", "resolveNpmPackage", name, reason);
      return PackageLensFactory.createUnexpectedError(
        'npm',
        { name, version: requestedVersion },
        reason
      );
    });
}

// export function createDirectoryPackage(pack) {
//   const { name, version } = pack.requested;

//   const fileRegExpResult = fileDependencyRegex.exec(version);
//   if (!fileRegExpResult) return PackageLensFactory.createInvalidVersion(name, version, 'npm');

//   const meta = {
//     type: "file",
//     remoteUrl: `${fileRegExpResult[1]}`
//   };

//   return PackageLensFactory.createPackage(
//     name,
//     version,
//     meta
//   );
// }

// export function createGithubPackage(pack, githubTaggedVersions, replaceVersionFn: ReplaceVersionFunction) {
//   const { requested: { name }, gitSpec } = pack;

//   const version = gitSpec.path({ noCommittish: false });
//   const userRepo = `${gitSpec.user}/${gitSpec.project}`;
//   const commitishSlug = gitSpec.committish ? `/commit/${gitSpec.committish}` : '';
//   const remoteUrl = `https://github.com/${userRepo}${commitishSlug}`;

//   // take a copy of the app config tagged versions
//   let taggedVersions = githubTaggedVersions.slice();

//   // ensure that commits are the first and the latest entries to be shown
//   taggedVersions.splice(0, 0, 'Commit');

//   // only show commits of showTaggedVersions is false
//   if (appSettings.showTaggedVersions === false)
//     taggedVersions = [taggedVersions[0]];

//   return taggedVersions.map((category, index) => {
//     const meta = {
//       category,
//       type: "github",
//       remoteUrl,
//       userRepo,
//       commitish: gitSpec.committish ? gitSpec.committish : '',
//       tag: {
//         isPrimaryTag: index === 0
//       }
//     };

//     return PackageLensFactory.createPackage(
//       name,
//       version,
//       meta,
//       replaceVersionFn
//     );
//   });
// }

export function npmReplaceVersion(packageInfo, newVersion) {
  const semver = require('semver');

  let existingVersion
  // test if the newVersion is a valid semver range
  // if it is then we need to use the commitish for github versions 
  if (packageInfo.source === PackageSourceTypes.git && semver.validRange(newVersion))
    existingVersion = packageInfo.gitSpec.commitish;
  else
    existingVersion = packageInfo.requested.version;

  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = formatWithExistingLeading(existingVersion, newVersion)
  return `${packageInfo.meta.userRepo}#${preservedLeadingVersion}`
}

export function customNpmAliasedReplaceVersion(packageInfo, newVersion) {
  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = formatWithExistingLeading(packageInfo.version, newVersion)
  return `npm:${packageInfo.resolved.name}@${preservedLeadingVersion}`;
}

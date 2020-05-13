import { formatWithExistingLeading } from 'core/packages/helpers/versionHelpers';
import * as ErrorFactory from 'core/errors/factory';
import { PackageSourceTypes, PackageVersionTypes } from 'core/packages/models/packageDocument';
import { ExpiryCacheMap } from 'core/caching/expiryCacheMap';
import { fetchNpmPackage } from 'providers/npm/pacoteApiClient'
import { PackageResponse, ReplaceVersionFunction } from 'core/packages/models/packageResponse';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { PackageRequest } from "core/packages/models/packageRequest";

const cache = new ExpiryCacheMap();

export function resolveNpmPackage(
  request: PackageRequest,
  replaceVersionFn: ReplaceVersionFunction
): Promise<Array<PackageResponse> | PackageResponse> {
  const cacheKey = `resolveNpmPackage_${request.package.name}@${request.package.version}_${request.package.path}`;
  // if (cache.hasExpired(cacheKey) === false) {
  //   return Promise.resolve(cache.get(cacheKey));
  // }

  return fetchNpmPackage(request)
    .then(function (document) {

      let replaceFn: ReplaceVersionFunction;
      if (replaceVersionFn === null) {
        replaceFn = (document.source === PackageSourceTypes.git) ?
          npmReplaceVersion :
          document.type === PackageVersionTypes.alias ?
            customNpmAliasedReplaceVersion :
            null;
      }

      // must be a registry version
      return ResponseFactory.createSuccess(document, replaceFn);
    })
    .then(function (pack) {
      return cache.set(cacheKey, pack);
    })
    .catch(error => {
      const { request } = error;

      ErrorFactory.createConsoleError('npm,',
        resolveNpmPackage.name,
        request.packageName,
        error
      );

      return error;
    });
}

// export function createDirectoryPackage(pack) {
//   const { name, version } = pack.requested;

//   const fileRegExpResult = fileDependencyRegex.exec(version);
//   if (!fileRegExpResult) return ResponseFactory.createInvalidVersion(name, version, 'npm');

//   const meta = {
//     type: "file",
//     remoteUrl: `${fileRegExpResult[1]}`
//   };

//   return ResponseFactory.createPackage(
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

//     return ResponseFactory.createPackage(
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

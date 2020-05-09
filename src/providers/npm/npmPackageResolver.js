/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from '../../appSettings';
import { ExpiryCacheMap } from '../../common/expiryCacheMap';
import { fileDependencyRegex, formatWithExistingLeading } from '../../common/utils';
import { filterTagsByName, buildTagsFromVersionMap, resolveVersionAgainstTags } from '../shared/versionUtils';
import { logErrorToConsole } from '../shared/utils';
import * as PackageFactory from '../shared/packageFactory';
import { PackageSourceTypes } from '../core/models/packageDocument';
import { fetchPackage } from './pacoteClientApi.js'

const cache = new ExpiryCacheMap();

const semver = require('semver');

export function resolveNpmPackage(packagePath, name, requestedVersion, appContrib, customGenerateVersion) {

  const cacheKey = `resolveNpmPackage_${name}@${requestedVersion}_${packagePath}`;
  if (cache.hasExpired(cacheKey) === false) {
    return Promise.resolve(cache.get(cacheKey));
  }

  return fetchPackage(packagePath, name, requestedVersion)
    .then(pack => {

      if (pack.source === PackageSourceTypes.directory)
        return createDirectoryPackage(pack);
      else if (pack.source === PackageSourceTypes.git) {
        return createGithubPackage(pack, appContrib.githubTaggedCommits, customNpmGenerateVersion);
      } else if (pack.type === 'alias') {
        return createNpmRegistryPackage(
          pack,
          appContrib,
          customNpmAliasedGenerateVersion
        );
      }

      // must be a registry version
      return createNpmRegistryPackage(
        pack,
        appContrib,
        customGenerateVersion
      );

    })
    .then(pack => {
      return cache.set(cacheKey, pack);
    })
    .catch(result => {
      const { npaResult, reason } = result;

      if (reason.code === 'E404') {
        return PackageFactory.createPackageNotFound(name, requestedVersion, 'npm');
      }

      if (reason.code === 'EUNSUPPORTEDPROTOCOL') {
        return PackageFactory.createPackageNotSupported(name, requestedVersion, 'npm');
      }

      if (reason.code === 'EINVALIDTAGNAME' || reason.message.includes('Invalid comparator:')) {
        return PackageFactory.createInvalidVersion(name, requestedVersion, 'npm');
      }

      if (reason.code === 128 && npaResult.type === 'git') {
        return PackageFactory.createGitFailed(npaResult.rawSpec, reason.message, 'npm');
      }

      logErrorToConsole("NPM", "resolveNpmPackage", name, reason);
      return PackageFactory.createUnexpectedError(name, reason);
    });
}

export function createDirectoryPackage(pack) {
  const { name, version } = pack.given;

  const fileRegExpResult = fileDependencyRegex.exec(version);
  if (!fileRegExpResult) return PackageFactory.createInvalidVersion(name, version, 'npm');

  const meta = {
    type: "file",
    remoteUrl: `${fileRegExpResult[1]}`
  };

  return PackageFactory.createPackage(
    name,
    version,
    meta,
    null
  );
}

export function createGithubPackage(pack, githubTaggedVersions, customGenerateVersion) {
  const { given: { name }, gitSpec } = pack;

  const version = gitSpec.path({ noCommittish: false });
  const userRepo = `${gitSpec.user}/${gitSpec.project}`;
  const commitishSlug = gitSpec.committish ? `/commit/${gitSpec.committish}` : '';
  const remoteUrl = `https://github.com/${userRepo}${commitishSlug}`;

  // take a copy of the app config tagged versions
  let taggedVersions = githubTaggedVersions.slice();

  // ensure that commits are the first and the latest entries to be shown
  taggedVersions.splice(0, 0, 'Commit');

  // only show commits of showTaggedVersions is false
  if (appSettings.showTaggedVersions === false)
    taggedVersions = [taggedVersions[0]];

  return taggedVersions.map((category, index) => {
    const meta = {
      category,
      type: "github",
      remoteUrl,
      userRepo,
      commitish: gitSpec.committish ? gitSpec.committish : '',
      tag: {
        isPrimaryTag: index === 0
      }
    };

    return PackageFactory.createPackage(
      name,
      version,
      meta,
      customGenerateVersion
    );
  });
}

export function createNpmRegistryPackage(pack, appContrib, customGenerateVersion = null) {
  const maxSatisfyingVersion = pack.versions[pack.versions.length - 1];

  let requestedVersion = pack.given.version === 'latest' ? maxSatisfyingVersion : pack.resolved.version;

  requestedVersion = resolveVersionAgainstTags(pack.tags, requestedVersion, requestedVersion);

  const latestEntry = pack.tags[0];

  // create a version map
  const versionMap = {
    releases: [latestEntry.version],
    taggedVersions: pack.tags,
    maxSatisfyingVersion
  }

  // build tags
  const extractedTags = buildTagsFromVersionMap(versionMap, requestedVersion);

  // grab the satisfiesEntry
  const satisfiesEntry = extractedTags[0];

  let filteredTags = extractedTags;
  if (appSettings.showTaggedVersions === false)
    // only show 'satisfies' and 'latest' entries when showTaggedVersions is false
    filteredTags = [
      satisfiesEntry,
      ...(satisfiesEntry.isLatestVersion ? [] : [extractedTags[1]])
    ];
  else if (appContrib.npmDistTagFilter.length > 0)
    // filter the tags using npm app config filter
    filteredTags = filterTagsByName(
      extractedTags,
      [
        // ensure we have a 'satisfies' entry
        'satisfies',
        // conditionally provide the latest entry
        ...(satisfiesEntry.isLatestVersion ? [] : ['latest']),
        // all other user tag name filters
        ...appContrib.npmDistTagFilter
      ]
    );

  // map the tags to packages
  return filteredTags.map((tag, index) => {
    // generate the package data for each tag
    const meta = {
      type: 'npm',
      tag
    };

    return PackageFactory.createPackage(
      pack.resolved.name,
      requestedVersion,
      meta,
      customGenerateVersion
    );
  });
}

export function customNpmGenerateVersion(packageInfo, newVersion) {
  let existingVersion
  // test if the newVersion is a valid semver range
  // if it is then we need to use the commitish for github versions 
  if (packageInfo.meta.type === 'github' && semver.validRange(newVersion))
    existingVersion = packageInfo.meta.commitish
  else
    existingVersion = packageInfo.version

  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = formatWithExistingLeading(existingVersion, newVersion)
  return `${packageInfo.meta.userRepo}#${preservedLeadingVersion}`
}

export function customNpmAliasedGenerateVersion(packageInfo, newVersion) {
  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = formatWithExistingLeading(packageInfo.version, newVersion)
  return `npm:${packageInfo.name}@${preservedLeadingVersion}`;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from 'common/appSettings';
import * as PackageFactory from 'common/packageGeneration';
import { fileDependencyRegex, gitHubDependencyRegex, formatWithExistingLeading } from 'common/utils';
import { filterTagsByName, buildTagsFromVersionMap, resolveVersionAgainstTags } from 'common/versionUtils';
import { npmViewVersion, npmViewDistTags, parseNpmArguments } from './npmClient.js'

const semver = require('semver');

export function npmPackageParser(packagePath, name, requestedVersion, appContrib) {
  return parseNpmArguments(name, requestedVersion)
    .then(npmVersionInfo => {
      // check if we have a directory
      if (npmVersionInfo.type === 'directory')
        return parseFileVersion(name, requestedVersion);

      // check if we have a github version
      if (npmVersionInfo.type === 'git' && (npmVersionInfo.hosted && npmVersionInfo.hosted.type === 'github')) {
        return parseGithubVersion(
          name,
          npmVersionInfo.hosted.path({ noCommittish: false }),
          appContrib.githubTaggedCommits,
          customNpmGenerateVersion
        );
      } else if (npmVersionInfo.type === 'git') {
        // TODO: implement raw git url support
        return PackageFactory.createPackageNotSupported(
          name,
          requestedVersion,
          'npm'
        );
      }

      // must be a registry version
      return parseNpmRegistryVersion(
        packagePath,
        name,
        requestedVersion,
        appContrib
      );

    })
    .catch(error => {
      if (error.code === 'EUNSUPPORTEDPROTOCOL') {
        return PackageFactory.createPackageNotSupported(
          name,
          requestedVersion,
          'npm'
        );
      }

      if (error.code === 'E404') {
        return PackageFactory.createPackageNotFound(
          name,
          requestedVersion,
          'npm'
        );
      }

      if (error.code === 'EINVALIDTAGNAME' || error.message.includes('Invalid comparator:')) {
        return PackageFactory.createInvalidVersion(
          name,
          requestedVersion,
          'npm'
        );
      }

      throw new Error("NPM: parseNpmArguments " + error);
    });
}

export function parseNpmRegistryVersion(packagePath, name, requestedVersion, appContrib, customGenerateVersion = null) {
  // get the matched version
  const viewVersionArg = `${name}@${requestedVersion}`;

  return npmViewVersion(packagePath, viewVersionArg)
    .then(maxSatisfyingVersion => {
      if (requestedVersion === 'latest')
        requestedVersion = maxSatisfyingVersion;

      return parseNpmDistTags(
        packagePath,
        name,
        requestedVersion,
        maxSatisfyingVersion,
        appContrib,
        customGenerateVersion
      );

    });
}

export function parseFileVersion(name, version) {
  const fileRegExpResult = fileDependencyRegex.exec(version);
  if (!fileRegExpResult) {
    return PackageFactory.createInvalidVersion(
      name,
      version,
      'npm'
    );
  }

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

export function parseGithubVersion(name, version, githubTaggedVersions, customGenerateVersion) {
  const gitHubRegExpResult = gitHubDependencyRegex.exec(version.replace('github:', ''));
  if (!gitHubRegExpResult)
    return;

  const proto = "https";
  const user = gitHubRegExpResult[1];
  const repo = gitHubRegExpResult[3];
  const userRepo = `${user}/${repo}`;
  const commitish = gitHubRegExpResult[4] ? gitHubRegExpResult[4].substring(1) : '';
  const commitishSlug = commitish ? `/commit/${commitish}` : '';
  const remoteUrl = `${proto}://github.com/${user}/${repo}${commitishSlug}`;

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
      commitish,
      tag: {
        isPrimaryTag: index === 0
      }
    };

    const parseResult = PackageFactory.createPackage(
      name,
      version,
      meta,
      customGenerateVersion
    );

    return parseResult;
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

export function parseNpmDistTags(packagePath, name, requestedVersion, maxSatisfyingVersion, appContrib, customGenerateVersion = null) {

  return npmViewDistTags(packagePath, name)
    .then(distTags => {
      const latestEntry = distTags[0];

      // map the versions
      const versionMap = {
        releases: [latestEntry.version],
        taggedVersions: distTags,
        maxSatisfyingVersion
      }

      // is the requestedVersion a dist tag ?
      if (requestedVersion !== 'latest') {
        requestedVersion = resolveVersionAgainstTags(distTags, requestedVersion, requestedVersion);
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
      return filteredTags
        .map((tag, index) => {
          // generate the package data for each tag
          const meta = {
            type: 'npm',
            tag
          };

          return PackageFactory.createPackage(
            name,
            requestedVersion,
            meta,
            customGenerateVersion
          );
        });
    });

}
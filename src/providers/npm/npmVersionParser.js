/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import {
  fileDependencyRegex,
  gitHubDependencyRegex,
  formatWithExistingLeading
} from '../../common/utils';
import appSettings from '../../common/appSettings';
import { 
  isOlderVersion, 
  filterTagsByName, 
  buildTagsFromVersionMap 
} from '../../common/versionUtils';
import * as PackageFactory from '../../common/packageGeneration';
import { npmViewVersion, npmViewDistTags, parseNpmVersion } from './npmAPI'

export function npmVersionParser(node, appConfig) {
  const { name, value: requestedVersion } = node;

  return parseNpmVersion(name, requestedVersion)
    .then(npmVersionInfo => {
      // check if we have a directory
      if (npmVersionInfo.type === 'directory')
        return parseFileVersion(node, name, requestedVersion);

      // check if we have a github version
      if (npmVersionInfo.type === 'git' && npmVersionInfo.hosted.type === 'github') {
        return parseGithubVersion(
          node,
          name,
          npmVersionInfo.hosted.path({ noCommittish: false }),
          appConfig.githubTaggedCommits,
          customNpmGenerateVersion
        );
      } else if (npmVersionInfo.type === 'git') {
        // TODO: implement raw git url support
        return [{
          node,
          package: PackageFactory.createPackageNotSupported(name, requestedVersion, 'npm')
        }];
      }

      // must be a registry version
      return parseNpmRegistryVersion(
        node,
        name,
        requestedVersion,
        appConfig
      );

    })
    .catch(error => {
      if (error.code === 'EUNSUPPORTEDPROTOCOL') {
        return [{
          node,
          package: PackageFactory.createPackageNotSupported(name, requestedVersion, 'npm')
        }];
      }

      if (error.code === 'E404') {
        return [{
          node,
          package: PackageFactory.createPackageNotFound(name, requestedVersion, 'npm')
        }];
      }

      if (error.code === 'EINVALIDTAGNAME' || error.message.includes('Invalid comparator:')) {
        return [{
          node,
          package: PackageFactory.createInvalidVersion(name, requestedVersion, 'npm')
        }];
      }

      throw new Error("NPM: parseNpmVersion " + error);
    });
}

export function parseNpmRegistryVersion(node, name, requestedVersion, appConfig, customGenerateVersion = null) {
  // get the matched version
  const viewVersionArg = `${name}@${requestedVersion}`;

  return npmViewVersion(viewVersionArg)
    .then(maxSatisfyingVersion => {
      if (requestedVersion === 'latest')
        requestedVersion = maxSatisfyingVersion;

      return npmViewDistTags(name)
        .then(distTags => {
          const latestEntry = distTags[0];

          // map the versions
          const versionMap = {
            releases: [latestEntry.version],
            taggedVersions: distTags,
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
              ...(satisfiesEntry.isLatestVersion ? [] : extractedTags[1])
            ];
          else if (appConfig.npmDistTagFilter.length > 0)
            // filter the tags using npm app config filter
            filteredTags = filterTagsByName(
              extractedTags,
              [
                // ensure we have a 'satisfies' entry
                'satisfies',
                // conditionally provide the latest entry
                ...(satisfiesEntry.isLatestVersion ? [] : 'latest'),
                // all other user tag name filters
                appConfig.npmDistTagFilter
              ]
            );

          // map the tags to packages
          return filteredTags
            .map((tag, index) => {
              const isTaggedVersion = index !== 0;
              const isOlderThanRequested = tag.version &&
                !tag.isInvalid &&
                requestedVersion &&
                isOlderVersion(tag.version, requestedVersion);

              // generate the package data for each tag
              const packageInfo = {
                type: 'npm',
                tag,
                isTaggedVersion,
                isOlderVersion: isOlderThanRequested
              };

              return {
                node,
                package: PackageFactory.createPackage(
                  name,
                  requestedVersion,
                  packageInfo,
                  customGenerateVersion
                )
              };
            });
        });
    });
}

export function parseFileVersion(node, name, version) {
  const fileRegExpResult = fileDependencyRegex.exec(version);
  if (!fileRegExpResult)
    return;

  const packageInfo = {
    type: "file",
    remoteUrl: `${fileRegExpResult[1]}`
  };

  return [{
    node,
    package: PackageFactory.createPackage(
      name,
      version,
      packageInfo,
      customNpmGenerateVersion
    )
  }];
}

export function parseGithubVersion(node, name, version, githubTaggedVersions, customGenerateVersion) {
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
  const taggedVersions = githubTaggedVersions.slice();

  // ensure that commits are the first and the latest entries to be shown
  taggedVersions.splice(0, 0, 'Commit');

  // only show commits of showTaggedVersions is false
  if (appSettings.showTaggedVersions === false)
    taggedVersions = [taggedVersions[0]];

  return taggedVersions.map((category, index) => {
    const isTaggedVersion = index !== 0;

    const meta = {
      category,
      type: "github",
      remoteUrl,
      userRepo,
      commitish,
      isTaggedVersion
    };

    const parseResult = {
      node,
      package: PackageFactory.createPackage(
        name,
        version,
        meta,
        customGenerateVersion
      )
    };

    return parseResult;
  });
}

export function customNpmGenerateVersion(packageInfo, newVersion) {
  const existingVersion
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
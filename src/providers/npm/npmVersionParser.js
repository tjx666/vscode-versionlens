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
import { tagFilter, isFixedVersion, isOlderVersion } from '../../common/versions';
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
          requestedVersion,
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

      throw new Error("NPM: parseNpmVersion " + error);
    });
}

export function parseNpmRegistryVersion(node, name, requestedVersion, appConfig, customGenerateVersion = null) {
  // check if its a valid semver, if not could be a tag like 'latest'
  const isValidSemver = semver.validRange(requestedVersion);

  // check if this is a fixed version
  const isFixed = isValidSemver && isFixedVersion(requestedVersion);

  // get the matched version
  const viewVersionArg = `${name}@${requestedVersion}`;
  return npmViewVersion(viewVersionArg)
    .then(satisifiesVersion => {

      return npmViewDistTags(name)
        .then(distTags => {
          const extractedTags = extractTagsFromDistTagList(requestedVersion, satisifiesVersion, distTags);
          const satisfiesEntry = extractedTags[0];

          // only show 'satisfies' and 'latest' entries when showTaggedVersions is false
          // filter by the appConfig.npmDistTagFilter
          let tagsToProcess;
          if (appSettings.showTaggedVersions === false)
            tagsToProcess = [
              satisfiesEntry,
              ...(satisfiesEntry.isLatestVersion ? [] : extractedTags[1])
            ];
          else if (appConfig.npmDistTagFilter.length > 0)
            tagsToProcess = tagFilter(distTags, [
              'satisfies',
              ...(satisfiesEntry.isLatestVersion ? [] : 'latest'),
              ...appConfig.npmDistTagFilter
            ]);
          else
            tagsToProcess = extractedTags;

          // map the tags to packages
          return tagsToProcess
            .map((tag, index) => {
              const isTaggedVersion = index !== 0;
              const isOlder = tag.version && isValidSemver && isOlderVersion(tag.version, requestedVersion);

              // generate the package data for each tag
              const packageInfo = {
                type: 'npm',
                isValidSemver,
                isFixedVersion: isFixed,
                tag,
                isTaggedVersion,
                isOlderVersion: isOlder
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
  const gitHubRegExpResult = gitHubDependencyRegex.exec(version);
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

  return taggedVersions.map(category => {
    const packageInfo = {
      category,
      type: "github",
      remoteUrl,
      userRepo,
      commitish
    };

    const parseResult = {
      node,
      package: PackageFactory.createPackage(
        name,
        version,
        packageInfo,
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

export function extractTagsFromDistTagList(requestedVersion, satisifiesVersion, distTags) {
  const latestEntry = distTags[0];
  const isSatisifiesVersionValid = semver.validRange(satisifiesVersion);
  const isRequestedVersionValid = semver.validRange(requestedVersion);

  const satisifiesLatest = satisifiesVersion && semver.satisfies(satisifiesVersion, latestEntry.version);
  let satisfiesTag = false;
  let satisfiesTagName = '';

  const newerDistTags = distTags.filter(distTag => {
    // make sure this version isn't older than the satisifiesVersion
    if (isSatisifiesVersionValid && isOlderVersion(distTag.version, satisifiesVersion))
      return false;

    // make sure this version isn't the same as the satisifiesVersion
    if (distTag.version === satisifiesVersion) {
      // store the tag name with the satisifesEntry
      if (!satisfiesTag) {
        satisfiesTag = true;
        satisfiesTagName = distTag.name;
      };
      return false;
    }

    // package tags that have the same version as the latest will be ignored
    if (distTag.version == latestEntry.version)
      return false;

    return true;
  });

  if (satisifiesLatest) {
    // override these if we match the latest
    satisfiesTag = true;
    satisfiesTagName = 'latest';
  }

  const satisfiesEntry = {
    name: 'satisifes',
    version: satisifiesVersion,
    isLatestVersion: requestedVersion === 'latest' || requestedVersion.includes(latestEntry.version),
    installsLatestVersion: satisifiesLatest,
    satisfiesTag,
    satisfiesTagName,
    isInvalid: !isRequestedVersionValid && requestedVersion !== 'latest',
    versionMatchNotFound: !satisifiesVersion
  };

  // return an Array<TaggedVersion>
  return [
    satisfiesEntry,
    // only provide the latest when the satisfiesEntry is not the latest
    ...(satisfiesEntry.isLatestVersion ? [] : latestEntry),
    // concat all other tags if not older than the matched version
    ...newerDistTags
  ];
}
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
import { mapTaggedVersions, tagFilter, isFixedVersion, isOlderVersion } from '../../common/versions';
import { generateNotFoundPackage, generateNotSupportedPackage, generatePackage } from '../../common/packageGeneration';
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
          package: generateNotSupportedPackage(name, requestedVersion, 'npm')
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
          package: generateNotSupportedPackage(name, requestedVersion, 'npm')
        }];
      }

      if (error.code === 'E404') {
        return [{
          node,
          package: generateNotFoundPackage(name, requestedVersion, 'npm')
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
    .then(matchedVersion => {

      return npmViewDistTags(name)
        .then(tags => {
          // insert the 'Matches' entry before all other tagged entries
          const matchesEntry = { name: 'Matches', version: matchedVersion };
          tags.splice(0, 0, matchesEntry);

          // only show 'Matches' and 'latest' entries when showTaggedVersions is false
          // filter by the appConfig.npmDistTagFilter
          let tagsToProcess;
          if (appSettings.showTaggedVersions === false)
            tagsToProcess = [
              tags[0], // matches entry
              tags[1]  // latest entry
            ];
          else if (appConfig.npmDistTagFilter.length > 0)
            tagsToProcess = tagFilter(tags, [
              'Matches',
              'Latest',
              ...appConfig.npmDistTagFilter
            ]);
          else
            tagsToProcess = tags;

          // strip old tagged versions
          const recentTags = tagsToProcess
            .filter((tag, index) => {
              // we always want to keep the 'Matches' and 'Latest' entries
              if (index === 0 || index === 1)
                return true;

              // package tags that have the same version as the latest will be ignored
              if (tag.version == tagsToProcess[1].version)
                return false;

              // package tags that are older than then requestedVersion will be ignored
              const isOlder = isOlderVersion(tag.version, requestedVersion);
              return !isOlder;
            });

          // map the tags to packages
          return recentTags
            .map((tag, index) => {
              const isTaggedVersion = index !== 0;

              // generate the package data for each tag
              const packageInfo = {
                type: 'npm',
                isValidSemver,
                isFixedVersion: isFixed,
                tag,
                isTaggedVersion
              };

              return {
                node,
                package: generatePackage(
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
    package: generatePackage(
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
      package: generatePackage(
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
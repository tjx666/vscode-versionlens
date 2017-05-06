/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import {
  fileDependencyRegex,
  gitHubDependencyRegex,
  hasRangeSymbols,
  formatWithExistingLeading
} from '../../common/utils';
import appSettings from '../../common/appSettings';
import { npmViewDistTags } from './npmAPI'

export function npmVersionParser(node, appConfig) {
  const { name, value: version } = node;
  let result;

  // check if we have a local file version
  if (result = parseFileVersion(node, name, version))
    return result;

  // TODO: implement raw git url support too

  // check if we have a github version
  if (result = parseGithubVersion(node, name, version, appConfig.githubTaggedCommits))
    return result;

  // must be a registry version
  return parseNpmRegistryVersion(
    node,
    name,
    version,
    appConfig
  );
}

export function parseNpmRegistryVersion(node, name, version, appConfig, customGenerateVersion = null) {
  // check if its a valid semver, if not could be a tag
  const isValidSemver = semver.validRange(version);

  // check if the version has a range symbol
  const hasRangeSymbol = hasRangeSymbols(version);

  return npmViewDistTags(name)
    .then(distTags => {
      if (appSettings.showTaggedVersions === false) {
        distTags = [
          distTags[0]
        ];
      } else
        distTags.splice(1, 0, distTags[0]);

      return filterDistTags(distTags, appConfig)
        .map((distTag, index) => {
          const packageInfo = {
            type: 'npm',
            hasRangeSymbol,
            isValidSemver,
            distTag,
            isTaggedVersion: index !== 0
          };

          return {
            node,
            package: generatePackage(
              name,
              version,
              packageInfo,
              customGenerateVersion
            )
          };
        });
    });
}

export function parseFileVersion(node, name, version) {
  const fileRegExpResult = fileDependencyRegex.exec(version);
  if (fileRegExpResult) {
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
        customGenerateVersion
      )
    }];
  }
}

export function parseGithubVersion(node, name, version, githubTaggedVersions) {
  const gitHubRegExpResult = gitHubDependencyRegex.exec(version);
  if (gitHubRegExpResult) {
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
}

export function customGenerateVersion(packageInfo, newVersion) {
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

function filterDistTags(distTags, appConfig) {
  // if there is only one dist tag (i.e. latest tag) then return it
  if (distTags.length === 1)
    return distTags;

  // if there is more than one dist tag 
  // and npmshowTaggedVersions then return the first distTag (i.e. latest tag)
  if (distTags.length > 1 && appConfig.npmshowTaggedVersions === false)
    return [distTags[0]];

  // just show all distTags if no filters found
  if (!appConfig.npmDistTagFilter)
    return distTags;

  // get the dist tag filter from the config
  const tagFilters = appConfig.npmDistTagFilter.map(entry => entry.toLowerCase()); // make sure the filters are all lower case

  // if that is not dist tag filter then return all of them
  if (tagFilters.length === 0)
    return distTags;

  // return the filtered tags
  return distTags.filter(distTag => {
    const checkTagName = distTag.name.toLowerCase();
    return checkTagName === 'latest' || tagFilters.includes(checkTagName);
  });
}

function generatePackage(name, version, info, customGenerateVersion) {
  return {
    name,
    version,
    meta: info,
    customGenerateVersion
  };
}
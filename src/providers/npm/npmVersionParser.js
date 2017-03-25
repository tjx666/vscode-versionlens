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

export function npmVersionParser(node, appConfig) {
  const { location: packageName, value: packageVersion } = node.value;
  let result;

  // check if we have a local file version
  if (result = parseFileVersion(packageName, packageVersion))
    return result

  // TODO: implement raw git url support too

  // check if we have a github version
  if (result = parseGithubVersionLink(packageName, packageVersion, appConfig.githubCompareOptions))
    return result

  // must be a registry version
  // check if its a valid semver, if not could be a tag
  const isValidSemver = semver.validRange(packageVersion);

  // check if the version has a range symbol
  const hasRangeSymbol = hasRangeSymbols(packageVersion);

  return [{
    packageName,
    packageVersion,
    meta: {
      type: 'npm'
    },
    isValidSemver,
    hasRangeSymbol,
    customGenerateVersion: null
  }];
}

export function parseFileVersion(packageName, packageVersion) {
  const fileRegExpResult = fileDependencyRegex.exec(packageVersion);
  if (fileRegExpResult) {
    const meta = {
      type: "file",
      remoteUrl: `${fileRegExpResult[1]}`
    };
    return [{
      packageName,
      packageVersion,
      meta,
      customGenerateVersion: null
    }];
  }
}

export function parseGithubVersionLink(packageName, packageVersion, githubCompareOptions) {
  const gitHubRegExpResult = gitHubDependencyRegex.exec(packageVersion);
  if (gitHubRegExpResult) {
    const proto = "https";
    const user = gitHubRegExpResult[1];
    const repo = gitHubRegExpResult[3];
    const userRepo = `${user}/${repo}`;
    const commitish = gitHubRegExpResult[4] ? gitHubRegExpResult[4].substring(1) : '';
    const commitishSlug = commitish ? `/commit/${commitish}` : '';
    const remoteUrl = `${proto}://github.com/${user}/${repo}${commitishSlug}`;

    return githubCompareOptions.map(category => {
      const parseResult = {
        packageName,
        packageVersion,
        meta: {
          category,
          type: "github",
          remoteUrl,
          userRepo,
          commitish
        },
        customGenerateVersion: customGenerateVersion
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
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
  const { name, value: version } = node;
  let result;

  // check if we have a local file version
  if (result = parseFileVersion(node, name, version))
    return result

  // TODO: implement raw git url support too

  // check if we have a github version
  if (result = parseGithubVersionLink(node, name, version, appConfig.githubCompareOptions))
    return result

  // must be a registry version
  // check if its a valid semver, if not could be a tag
  const isValidSemver = semver.validRange(version);

  // check if the version has a range symbol
  const hasRangeSymbol = hasRangeSymbols(version);

  return [{
    node,
    package: {
      name,
      version,
      meta: {
        type: 'npm',
        tag: 'latest'
      },
      isValidSemver,
      hasRangeSymbol,
      customGenerateVersion: null
    }
  }];
}

export function parseFileVersion(node, name, version) {
  const fileRegExpResult = fileDependencyRegex.exec(version);
  if (fileRegExpResult) {
    const meta = {
      type: "file",
      remoteUrl: `${fileRegExpResult[1]}`
    };
    return [{
      node,
      package: {
        name,
        version,
        meta,
        customGenerateVersion: null
      }
    }];
  }
}

export function parseGithubVersionLink(node, name, version, githubCompareOptions) {
  const gitHubRegExpResult = gitHubDependencyRegex.exec(version);
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
        node,
        package: {
          name,
          version,
          meta: {
            category,
            type: "github",
            remoteUrl,
            userRepo,
            commitish
          },
          customGenerateVersion: customGenerateVersion
        }
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
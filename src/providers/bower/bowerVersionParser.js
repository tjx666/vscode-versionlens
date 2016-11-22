/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import { gitHubDependencyRegex } from '../../common/utils';

export function bowerVersionParser(node, appConfig) {
  const { location: packageName, value: packageVersion } = node.value;
  let result;

  // check if we have a github version
  if (result = parseGithubVersionLink(packageName, packageVersion, appConfig.githubCompareOptions))
    return result;

  // check if its a valid semver, if not could be a tag
  const isValidSemver = semver.validRange(packageVersion);
  return [{
    packageName,
    packageVersion,
    meta: {
      type: 'bower'
    },
    isValidSemver,
    customGenerateVersion: null
  }];
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
        customGenerateVersion: (packageInfo, newVersion) => `${packageInfo.meta.userRepo}#${newVersion}`
      };
      return parseResult;
    });
  }
}
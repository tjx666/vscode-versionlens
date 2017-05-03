/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import { gitHubDependencyRegex, hasRangeSymbols } from '../../common/utils';

export function bowerVersionParser(node, appConfig) {
  const { name, value: version } = node;
  let result;

  // check if we have a github version
  if (result = parseGithubVersionLink(node, name, version, appConfig.githubCompareOptions))
    return result;

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
        tag: 'latest',
        type: 'bower'
      },
      isValidSemver,
      hasRangeSymbol,
      customGenerateVersion: null
    }
  }];
}

export function parseGithubVersionLink(node, packageName, packageVersion, githubCompareOptions) {
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
        node, package: {
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
        }
      };
      return parseResult;
    });
  }
}
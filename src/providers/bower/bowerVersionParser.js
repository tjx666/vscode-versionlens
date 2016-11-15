/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { gitHubDependencyRegex } from '../../common/utils';
import * as semver from 'semver';

export function bowerVersionParser(node) {
  const { location: packageName, value: packageVersion } = node.value;
  let meta;
  let result;

  // check if we have a github version
  if (result = parseGitHubVersionLink(packageName, packageVersion))
    return result;

  // check if its a valid semver, if not could be a tag
  const isValidSemver = semver.validRange(packageVersion);
  return {
    packageName,
    packageVersion,
    meta: null,
    isValidSemver,
    customGenerateVersion: null
  };
}

function parseGitHubVersionLink(packageName, packageVersion) {
  const gitHubRegExpResult = gitHubDependencyRegex.exec(packageVersion);
  if (gitHubRegExpResult) {
    const proto = "https";
    const user = gitHubRegExpResult[1];
    const repo = gitHubRegExpResult[3];
    const meta = {
      type: "github",
      remoteURI: `${proto}://github.com/${user}/${repo}`
    };
    return {
      packageName,
      packageVersion,
      meta,
      customGenerateVersion: null
    };
  }
}
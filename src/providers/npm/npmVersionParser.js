/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { fileDependencyRegex, gitHubDependencyRegex } from '../../common/utils';
import * as semver from 'semver';

export function npmVersionParser(node) {
  const { location: packageName, value: packageVersion } = node.value;
  let result;

  // check if we have a local file version
  if (result = parseFileVersion(packageName, packageVersion))
    return result

  // TODO: implement raw git url support too

  // check if we have a github version
  if (result = parseGitHubVersionLink(packageName, packageVersion))
    return result

  // must be a registry version
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

export function parseFileVersion(packageName, packageVersion) {
  const fileRegExpResult = fileDependencyRegex.exec(packageVersion);
  if (fileRegExpResult) {
    const meta = {
      type: "file",
      remoteURI: `${fileRegExpResult[1]}`
    };
    return {
      packageName,
      packageVersion,
      meta,
      customGenerateVersion: null
    };
  }
}

export function parseGitHubVersionLink(packageName, packageVersion) {
  const gitHubRegExpResult = gitHubDependencyRegex.exec(packageVersion);
  if (gitHubRegExpResult) {
    const proto = "https";
    const user = gitHubRegExpResult[1];
    const repo = gitHubRegExpResult[3];
    const commitHash = gitHubRegExpResult[4] ? `/commit/${gitHubRegExpResult[4].substring(1)}` : '';
    const meta = {
      type: "github",
      remoteURI: `${proto}://github.com/${user}/${repo}${commitHash}`
    };
    return {
      packageName,
      packageVersion,
      meta,
      customGenerateVersion: null
    };
  }
}

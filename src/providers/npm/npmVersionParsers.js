/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { fileDependencyRegex, gitHubDependencyRegex } from '../../common/utils';

export function npmVersionParser(node) {
  const { location: packageName, value: packageVersion } = node.value;
  let commandMeta;

  // check if we have a local file version
  const fileRegExpResult = fileDependencyRegex.exec(packageVersion);
  if (fileRegExpResult) {
    commandMeta = {
      type: "file",
      uri: `${fileRegExpResult[1]}`
    };
    return {
      packageName,
      packageVersion,
      commandMeta,
      versionAdapter: null
    };
  }

  // TODO: implement raw git url support too

  // check if we have a github version
  const gitHubRegExpResult = gitHubDependencyRegex.exec(packageVersion);
  if (gitHubRegExpResult) {
    const proto = "https";
    const user = gitHubRegExpResult[1];
    const repo = gitHubRegExpResult[3];
    const commitHash = gitHubRegExpResult[4] ? `/commit/${gitHubRegExpResult[4].substring(1)}` : '';
    commandMeta = {
      type: "web",
      uri: `${proto}://github.com/${user}/${repo}${commitHash}`
    };
    return {
      packageName,
      packageVersion,
      commandMeta,
      versionAdapter: null
    };
  }

  // must be a registry version
  return {
    packageName,
    packageVersion,
    commandMeta,
    versionAdapter: null
  };
}

// Extension Parsers 

// Jspm
const jspmDependencyRegex = /^npm:(.*)@(.*)$/;
export function jspmVersionParser(node) {
  const { location: packageName, value: packageVersion } = node.value;
  const regExpResult = jspmDependencyRegex.exec(packageVersion);
  if (!regExpResult)
    return;

  const newPackageName = regExpResult[1];
  const newPackageVersion = regExpResult[2];
  return {
    packageName: newPackageName,
    packageVersion: newPackageVersion,
    versionAdapter: (lens, version, adaptedVersion) => `npm:${newPackageName}@${adaptedVersion}`
  };
}
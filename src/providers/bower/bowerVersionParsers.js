/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { fileDependencyRegex, gitHubDependencyRegex } from '../../common/utils';

export function bowerVersionParser(node) {
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
    commandMeta = {
      type: "web",
      uri: `${proto}://github.com/${user}/${repo}`
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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import { parseFileVersion, parseGitHubVersionLink } from './npmVersionParser';

const jspmDependencyRegex = /^(npm|github):(.*)@(.*)$/;
export function jspmVersionParser(node) {
  const { location: packageName, value: packageVersion } = node.value;
  const regExpResult = jspmDependencyRegex.exec(packageVersion);
  if (!regExpResult)
    return;

  const packageManager = regExpResult[1];
  const extractedPkgName = regExpResult[2];
  const newPkgVersion = regExpResult[3];

  if (packageManager === 'github') {
    const result = parseGitHubVersionLink(extractedPkgName, extractedPkgName)
    result.customGenerateVersion = customGenerateVersion;
    return result;
  }

  const isValidSemver = semver.validRange(newPkgVersion);
  return {
    packageName: extractedPkgName,
    packageVersion: newPkgVersion,
    isValidSemver,
    meta: {
      type: 'npm'
    },
    customGenerateVersion
  };
}

function customGenerateVersion(codeLens, newVersion) {
  return `codeLens.meta.type:${codeLens.packageName}@${newVersion}`
}
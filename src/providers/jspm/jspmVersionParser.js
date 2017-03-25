/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import { hasRangeSymbols, formatWithExistingLeading } from '../../common/utils';
import { parseFileVersion, parseGithubVersionLink } from '../npm/npmVersionParser';

const jspmDependencyRegex = /^(npm|github):(.*)@(.*)$/;
export function jspmVersionParser(node, appConfig) {
  const { location: packageName, value: packageVersion } = node.value;
  const regExpResult = jspmDependencyRegex.exec(packageVersion);
  if (!regExpResult)
    return;

  const packageManager = regExpResult[1];
  const extractedPkgName = regExpResult[2];
  const newPkgVersion = regExpResult[3];

  if (packageManager === 'github') {
    const results = parseGithubVersionLink(extractedPkgName, `${extractedPkgName}#${newPkgVersion}`, appConfig.githubCompareOptions);
    return results.map(result => {
      result.customGenerateVersion = customGenerateVersion;
      return result;
    });
  }

  const isValidSemver = semver.validRange(newPkgVersion);

  // check if the version has a range symbol
  const hasRangeSymbol = hasRangeSymbols(packageVersion);

  return [{
    packageName: extractedPkgName,
    packageVersion: newPkgVersion,
    isValidSemver,
    hasRangeSymbol,
    meta: {
      type: 'npm'
    },
    customGenerateVersion
  }];
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
  return `${packageInfo.meta.type}:${packageInfo.name}@${preservedLeadingVersion}`
}
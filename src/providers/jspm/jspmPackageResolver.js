/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as PackageFactory from 'common/packageGeneration';
import { formatWithExistingLeading } from 'common/utils';
import { parseNpmRegistryVersion, parseGithubVersion } from 'providers/npm/npmPackageResolver';

const semver = require('semver');

const jspmDependencyRegex = /^(npm|github):(.*)@(.*)$/;
export function resolveJspmPackage(packagePath, name, version, appContrib) {
  // check for supported package resgitries
  const regExpResult = jspmDependencyRegex.exec(version);
  if (!regExpResult) {
    return PackageFactory.createPackageNotSupported(
      name,
      version,
      'jspm'
    );
  }

  const packageManager = regExpResult[1];
  const extractedPkgName = regExpResult[2];
  const newPkgVersion = regExpResult[3];

  if (packageManager === 'github') {
    return parseGithubVersion(
      extractedPkgName,
      `${extractedPkgName}#${newPkgVersion}`,
      appContrib.githubTaggedCommits,
      customJspmGenerateVersion
    );
  }

  return parseNpmRegistryVersion(
    packagePath,
    extractedPkgName,
    newPkgVersion,
    appContrib,
    customJspmGenerateVersion
  );
}

export function customJspmGenerateVersion(packageInfo, newVersion) {
  let existingVersion
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
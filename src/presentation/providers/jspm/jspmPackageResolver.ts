import { formatWithExistingLeading } from '../../../common/utils';
import * as PackageLensFactory from 'presentation/lenses/factories/packageLensFactory';
import { resolveNpmPackage } from 'presentation/providers/npm/npmPackageResolver';
import { PackageLens } from 'presentation/lenses/models/packageLens';
import { PackageSourceTypes } from 'core/packages/models/packageDocument';

const jspmDependencyRegex = /^(npm|github):(.*)@(.*)$/;
export function resolveJspmPackage(packagePath, name, version) {
  // check for supported package resgitries
  const regExpResult = jspmDependencyRegex.exec(version);
  if (!regExpResult) {
    return PackageLensFactory.createPackageNotSupported('jspm', { name, version });
  }

  const packageManager = regExpResult[1];
  const extractedPkgName = regExpResult[2];
  const newPkgVersion = regExpResult[3];

  if (packageManager === 'github') {
    return resolveNpmPackage(
      packagePath,
      name,
      `${extractedPkgName}#${newPkgVersion}`,
      customJspmReplaceVersion
    );
  }

  return resolveNpmPackage(
    packagePath,
    extractedPkgName,
    newPkgVersion,
    customJspmReplaceVersion
  );
}

export function customJspmReplaceVersion(packageInfo: PackageLens, newVersion: string): string {
  const type = (packageInfo.source === PackageSourceTypes.git) ? 'github' : 'npm';
  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = formatWithExistingLeading(packageInfo.requested.version, newVersion);
  return `${type}:${packageInfo.requested.name}@${preservedLeadingVersion}`;
}
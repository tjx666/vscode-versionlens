import { formatWithExistingLeading } from '../../../common/utils';
import { PackageSourceTypes } from 'core/packages/models/packageDocument';
import * as PackageLensFactory from 'presentation/lenses/factories/packageLensFactory';
import { resolveNpmPackage } from 'presentation/providers/npm/npmPackageResolver';
import { PackageLens, ReplaceVersionFunction } from 'presentation/lenses/models/packageLens';

const jspmDependencyRegex = /^(npm|github):(.*)@(.*)$/;

export function resolveJspmPackage(
  packagePath: string,
  packageName: string,
  packageVersion: string,
  replaceVersionFn: ReplaceVersionFunction): Promise<Array<PackageLens> | PackageLens> {

  // check for supported package resgitries
  const regExpResult = jspmDependencyRegex.exec(packageVersion);
  if (!regExpResult) {
    return Promise.resolve(
      PackageLensFactory.createPackageNotSupported('jspm', { name: packageName, version: packageVersion })
    );
  }

  const packageManager = regExpResult[1];
  const extractedPkgName = regExpResult[2];
  const newPkgVersion = regExpResult[3];

  if (packageManager === 'github') {
    return resolveNpmPackage(
      packagePath,
      packageName,
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
import { formatWithExistingLeading } from '../../../common/utils';
import { PackageSourceTypes } from 'core/packages/models/packageDocument';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { resolveNpmPackage } from 'presentation/providers/npm/npmPackageResolver';
import { PackageResponse, ReplaceVersionFunction } from 'core/packages/models/packageResponse';
import { FetchRequest } from 'core/clients/models/fetch';

const jspmDependencyRegex = /^(npm|github):(.*)@(.*)$/;

export async function resolveJspmPackage(
  request: FetchRequest,
  replaceVersionFn: ReplaceVersionFunction
): Promise<Array<PackageResponse> | PackageResponse> {

  // check for supported package resgitries
  const regExpResult = jspmDependencyRegex.exec(request.packageVersion);
  if (!regExpResult) {
    return Promise.resolve(
      ResponseFactory.createNotSupported('jspm', { name: request.packageName, version: request.packageVersion })
    );
  }

  const packageManager = regExpResult[1];
  const extractedPkgName = regExpResult[2];
  const newPkgVersion = regExpResult[3];

  if (packageManager === 'github') {
    return resolveNpmPackage(
      {
        packagePath: request.packagePath,
        packageName: request.packageName,
        packageVersion: `${extractedPkgName}#${newPkgVersion}`,
      },
      customJspmReplaceVersion
    );
  }

  return resolveNpmPackage(
    {
      packagePath: request.packagePath,
      packageName: request.packageName,
      packageVersion: newPkgVersion,
    },
    customJspmReplaceVersion
  );
}

export function customJspmReplaceVersion(packageInfo: PackageResponse, newVersion: string): string {
  const type = (packageInfo.source === PackageSourceTypes.git) ? 'github' : 'npm';
  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = formatWithExistingLeading(packageInfo.requested.version, newVersion);
  return `${type}:${packageInfo.requested.name}@${preservedLeadingVersion}`;
}
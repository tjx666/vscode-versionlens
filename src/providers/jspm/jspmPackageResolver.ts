import { formatWithExistingLeading } from 'common/utils';
import { PackageSourceTypes } from 'core/packages/models/packageDocument';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { resolveNpmPackage } from 'providers/npm/npmPackageResolver';
import { PackageResponse } from 'core/packages/models/packageResponse';
import { PackageRequest } from "core/packages/models/packageRequest";

const jspmDependencyRegex = /^(npm|github):(.*)@(.*)$/;

export async function resolveJspmPackage(
  request: PackageRequest
): Promise<Array<PackageResponse> | PackageResponse> {

  // check for supported package resgitries
  const regExpResult = jspmDependencyRegex.exec(request.package.version);
  if (!regExpResult) {
    return Promise.resolve(
      ResponseFactory.createNotSupported('jspm', request.package)
    );
  }

  const packageManager = regExpResult[1];
  const extractedPkgName = regExpResult[2];
  const newPkgVersion = regExpResult[3];

  if (packageManager === 'github') {
    request.package.version = `${extractedPkgName}#${newPkgVersion}`;
    return resolveNpmPackage(request, customJspmReplaceVersion);
  }

  request.package.version = newPkgVersion;
  return resolveNpmPackage(request, customJspmReplaceVersion);
}

export function customJspmReplaceVersion(packageInfo: PackageResponse, newVersion: string): string {
  const type = (packageInfo.source === PackageSourceTypes.git) ? 'github' : 'npm';
  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = formatWithExistingLeading(packageInfo.requested.version, newVersion);
  return `${type}:${packageInfo.requested.name}@${preservedLeadingVersion}`;
}
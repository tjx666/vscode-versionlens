import { PackageResponse, VersionHelpers } from 'core.packages';

export function defaultReplaceFn(
  packageResponse: PackageResponse, newVersion: string
): string {
  return VersionHelpers.formatWithExistingLeading(
    packageResponse.requested.version,
    newVersion
  );
}
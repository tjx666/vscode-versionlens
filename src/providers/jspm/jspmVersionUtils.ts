import {
  VersionHelpers,
  PackageSourceTypes,
  PackageResponse,
} from "core/packages";

export function customJspmFormatVersion(packageInfo: PackageResponse, newVersion: string): string {
  const type = (packageInfo.source === PackageSourceTypes.git) ? 'github' : 'npm';
  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = VersionHelpers.formatWithExistingLeading(packageInfo.requested.version, newVersion);
  return `${type}:${packageInfo.requested.name}@${preservedLeadingVersion}`;
}
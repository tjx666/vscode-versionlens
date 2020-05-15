import {
  VersionHelpers,
  PackageSourceTypes,
  PackageResponse,
  PackageVersionTypes,
} from "core/packages";

export function npmReplaceVersion(packageInfo: PackageResponse, newVersion: string): string {
  if (packageInfo.source === PackageSourceTypes.git) {
    return replaceGitVersion(packageInfo, newVersion);
  }

  if (packageInfo.type === PackageVersionTypes.alias) {
    return replaceAliasVersion(packageInfo, newVersion);
  }

  // fallback to default
  return VersionHelpers.formatWithExistingLeading(
    packageInfo.requested.version,
    newVersion
  );
}

function replaceGitVersion(packageInfo: PackageResponse, newVersion: string): string {
  // return `${packageInfo.meta.userRepo}#${preservedLeadingVersion}`
  return 'Not implemented yet'
}

function replaceAliasVersion(packageInfo: PackageResponse, newVersion: string): string {
  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = VersionHelpers.formatWithExistingLeading(
    packageInfo.requested.version,
    newVersion
  );

  return `npm:${packageInfo.resolved.name}@${preservedLeadingVersion}`;
}

export enum PackageErrors {
  NotFound,
  NotSupported,
  InvalidVersion,
  Unexpected,
};

export type Package = {
  name: string,
  version: string,
  meta: PackageMeta,
  customGenerateVersion: Function,
};

export type PackageMeta = {
  type: string,
  error: PackageErrors,
  message: string,
  tag: any,
};

export interface IPackageCodeLens {
  replaceRange: any,
  package: Package,
  documentUrl: string
  command: any,
  generateNewVersion: (string) => string,
  getTaggedVersionPrefix: (string) => string,
  isInvalidVersion: () => boolean,
  isTaggedVersion: () => boolean,
  isTagName: (string) => boolean,
  isFixedVersion: () => boolean,
  isMetaType: (string) => boolean,
  matchesLatestVersion: () => boolean,
  satisfiesLatestVersion: () => boolean,
  matchesPrereleaseVersion: () => boolean,
  getTaggedVersion: () => boolean,
  packageNotFound: () => boolean,
  packageNotSupported: () => boolean,
  packageUnexpectedError: () => boolean,
  versionMatchNotFound: () => boolean,
  getInstallIndicator: () => string,
  setCommand: (string, { }, []) => any,
};

export interface TaggedVersion {
  name: string,
  version: string,
  isLatestVersion?: boolean,
  isOlderThanRequested?: boolean,
};

export interface VersionInfo {
  version: string,
  isPrerelease: boolean,
  prereleaseGroup: string,
};

export interface VersionMap {
  releases: Array<string>,
  taggedVersions: Array<TaggedVersion>,
  maxSatisfyingVersion?: string,
};

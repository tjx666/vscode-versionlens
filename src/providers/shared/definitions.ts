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

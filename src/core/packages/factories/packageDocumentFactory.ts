import {
  PackageNameVersion,
  PackageVersionTypes,
  PackageSourceTypes,
  PackageVersionStatus,
  PackageTagFlags,
  PackageDocument,
  PackageTag
} from '../models/packageDocument'

export function createNotFound(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.directory;

  const tags: Array<PackageTag> = [
    {
      name: PackageVersionStatus.notfound,
      version: requested.version,
      flags: PackageTagFlags.readOnly
    },
    {
      name: PackageVersionStatus.latest,
      version: 'latest',
      flags: PackageTagFlags.updatable | PackageTagFlags.readOnly
    },
  ];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    tags
  };
}

export function createInvalidVersion(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.registry;
  const tags: Array<PackageTag> = [
    {
      name: PackageVersionStatus.invalid,
      version: requested.version,
      flags: PackageTagFlags.readOnly
    },
    {
      name: PackageVersionStatus.latest,
      version: 'latest',
      flags: PackageTagFlags.updatable | PackageTagFlags.readOnly
    },
  ]

  return {
    provider: 'npm',
    source,
    type,
    requested,
    resolved: null,
    tags
  };
}

export function createNotSupported(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.registry;
  const tags: Array<PackageTag> = [
    {
      name: PackageVersionStatus.notsupported,
      version: requested.version,
      flags: PackageTagFlags.readOnly
    },
    {
      name: PackageVersionStatus.latest,
      version: 'latest',
      flags: PackageTagFlags.updatable | PackageTagFlags.readOnly
    },
  ];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    tags
  };
}

export function createGitFailed(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.git;

  const tags: Array<PackageTag> = [
    {
      name: PackageVersionStatus.notfound,
      version: requested.version,
      flags: PackageTagFlags.readOnly
    },
  ]

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    tags
  };
}
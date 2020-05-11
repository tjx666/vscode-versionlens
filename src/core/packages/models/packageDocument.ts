export type PackageResolverDelegate = (packagePath: string, name: string, version: string, replaceVersionFn) => Promise<PackageDocument>;

export enum PackageSourceTypes {
  directory = 'directory',
  file = 'file',
  git = 'git',
  registry = 'registry',
}

export enum PackageVersionTypes {
  version = 'version',
  range = 'range',
  tag = 'tag',
  alias = 'alias',
  committish = 'committish',
}

export enum PackageVersionStatus {
  notfound = 'package not found',
  invalid = 'invalid entry',
  nomatch = 'no match',
  satisifies = 'satisifies',
  latest = 'latest',
  fixed = 'fixed',
}

export type PackageNameVersion = {
  name: string,
  version: string,
}

export enum PackageTagFlags {
  // bitwise
  updatable = 1,
  readOnly = 2,
}

export type PackageTag = {
  name: string,
  version: string,
  flags: PackageTagFlags,
}

export type PackageDocument = {
  provider: string,
  source: PackageSourceTypes,
  type: PackageVersionTypes,
  requested: PackageNameVersion,
  resolved: PackageNameVersion,
  tags: Array<PackageTag>,
  releases?: Array<string>,
  prereleases?: Array<string>,
  gitSpec?: any,
}
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
  notsupported = 'not supported',
  invalid = 'invalid entry',
  nomatch = 'no match',
  satisfies = 'satisfies',
  latest = 'latest',
  fixed = 'fixed',
}

export type PackageNameVersion = {
  name: string,
  version: string,
}


export type PackagePrereleaseDictionary = {
  [tagName: string]: Array<string>
}

export enum PackageSuggestionFlags {
  // bitwise
  status = 1,
  release = 2,
  prerelease = 4,
  tag = 8,
}

export type PackageSuggestion = {
  name: string,
  version: string,
  flags: PackageSuggestionFlags,
}

export type PackageDocument = {
  provider: string,
  source: PackageSourceTypes,
  type: PackageVersionTypes,
  requested: PackageNameVersion,
  resolved: PackageNameVersion,
  tags: Array<PackageSuggestion>,
  releases?: Array<string>,
  prereleases?: Array<string>,
  gitSpec?: any,
}
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

export type PackageNameVersion = {
  name: string,
  version: string,
}

export type PackageDocument = {
  provider: string,
  source: PackageSourceTypes,
  type: PackageVersionTypes,
  given: PackageNameVersion,
  resolved: PackageNameVersion,
  tags?: Array<PackageNameVersion>,
  versions?: Array<string>,
  gitSpec?: any,
}
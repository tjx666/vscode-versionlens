import { PackageIdentifier } from "./packageRequest";
import { PackageResponseStatus } from "./packageResponse";

export type PackageResolverDelegate = (packagePath: string, name: string, version: string, replaceVersionFn) => Promise<PackageDocument>;

export enum PackageSourceTypes {
  Directory = 'directory',
  File = 'file',
  Git = 'git',
  Github = 'github',
  Registry = 'registry',
}

export enum PackageVersionTypes {
  Version = 'version',
  Range = 'range',
  Tag = 'tag',
  Alias = 'alias',
  Committish = 'committish',
}

export enum PackageVersionStatus {
  NotFound = 'package not found',
  NotSupported = 'not supported',
  Invalid = 'invalid entry',
  NoMatch = 'no match',
  Satisfies = 'satisfies',
  Latest = 'latest',
  Fixed = 'fixed',
}

export type PackageNameVersion = {
  name: string,
  version: string,
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
  response?: PackageResponseStatus,
  type: PackageVersionTypes,
  requested: PackageIdentifier,
  resolved: PackageNameVersion,
  suggestions: Array<PackageSuggestion>,
  releases?: Array<string>,
  prereleases?: Array<string>,
  gitSpec?: any,
}
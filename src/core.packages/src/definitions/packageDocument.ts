import { PackageIdentifier } from "./packageRequest";
import { PackageResponseStatus } from "../definitions/packageResponse";

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
  NotAuthorized = 'not authorized',
  NotSupported = 'not supported',
  ConnectionRefused = 'connection refused',
  Forbidden = '403 forbidden',
  Invalid = 'invalid entry',
  NoMatch = 'no match',
  Satisfies = 'satisfies',
  Latest = 'latest',
  LatestIsPrerelease = 'latest prerelease',
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
  providerName: string,
  source: PackageSourceTypes,
  response?: PackageResponseStatus,
  type: PackageVersionTypes,
  requested: PackageIdentifier,
  resolved: PackageNameVersion,
  suggestions: Array<PackageSuggestion>,
  gitSpec?: any,
}
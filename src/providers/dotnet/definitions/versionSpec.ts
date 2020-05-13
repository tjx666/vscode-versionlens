import { PackageVersionTypes } from 'core/packages/models/packageDocument';

export type NugetVersionSpec = {
  version?: string;
  hasFourSegments?: boolean;
  isMinInclusive?: boolean;
  isMaxInclusive?: boolean;
  minVersionSpec?: NugetVersionSpec;
  maxVersionSpec?: NugetVersionSpec;
};

export type DotNetVersionSpec = {
  type: PackageVersionTypes,
  rawVersion: string,
  resolvedVersion: string,
  spec: NugetVersionSpec,
};
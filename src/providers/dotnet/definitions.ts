import { PackageVersionTypes } from 'core/packages';

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

export enum DotNetSourceProtocols {
  file = 'file:',
  https = 'https:',
}

export type DotNetSource = {
  enabled: boolean,
  machineWide: boolean,
  source: string,
  protocol: DotNetSourceProtocols,
}

export type NuGetClientData = {
  provider: string,
  sources: Array<DotNetSource>
}
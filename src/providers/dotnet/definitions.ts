import { PackageVersionTypes } from 'core/packages';
import { RegistryProtocols } from 'core/clients/helpers/urlHelpers';

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


export type DotNetSource = {
  enabled: boolean,
  machineWide: boolean,
  url: string,
  protocol: RegistryProtocols,
}

export type NuGetClientData = {
  provider: string,
  sources: Array<DotNetSource>
}
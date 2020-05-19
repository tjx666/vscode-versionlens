import { PackageVersionTypes } from 'core/packages';
import { RegistryProtocols } from 'core/clients/helpers/urlHelpers';
import { NugetVersionSpec } from './nuget';

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
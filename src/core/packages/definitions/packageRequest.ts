import { PackageDocument } from './packageDocument';
import { IPackageDependencyLens } from './iPackageDependencyLens';

export type PackageIdentifier = {
  path: string;
  name: string;
  version: string;
}

export type PackageRequestFunction<TClientData> = (
  request: PackageRequest<TClientData>
) => Promise<PackageDocument>;

export type PackageRequest<TClientData> = {
  // provider descriptor
  providerName: string;

  // provider specific data
  clientData: TClientData,

  // dependency ranges
  dependency: IPackageDependencyLens;

  // package to fetch
  package: PackageIdentifier;

  // 
  includePrereleases: boolean;

  // number of fallback attempts
  attempt: number;
};
import { PackageDocument } from './packageDocument';
import { IPackageDependency } from './iPackageDependency';

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
  dependency: IPackageDependency;

  // package to fetch
  package: PackageIdentifier;

  // 
  includePrereleases: boolean;

  // number of fallback attempts
  attempt: number;
};
import { ILogger } from 'core/logging';
import { PackageDocument } from './packageDocument';

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

  // package to fetch
  package: PackageIdentifier;

  includePrereleases: boolean;

  logger: ILogger;
};
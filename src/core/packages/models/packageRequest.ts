import { ILogger } from 'core/logging/definitions';
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
  // todo flesh out provider descriptor
  provider?: string;

  // provider specific data
  clientData: TClientData,

  // package to fetch
  package: PackageIdentifier;

  // todo make this a logger provider
  logger: ILogger;
};

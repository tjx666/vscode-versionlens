import { ILogger } from 'core/logging/definitions';
import { PackageResponse, ReplaceVersionFunction } from './packageResponse';
import { PackageDocument } from './packageDocument';

export type PackageIdentifier = {
  path: string;
  name: string;
  version: string;
}

export type PackageRequest = {
  provider?: string;
  package: PackageIdentifier;
  logger: ILogger;
};

export type PackageRequestFunction = (
  request: PackageRequest
) => Promise<PackageDocument>;
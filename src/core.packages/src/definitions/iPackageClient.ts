import { ILogger } from 'core.logging';
import { IProviderConfig } from 'core.providers';

import { PackageRequest } from "./packageRequest";
import { PackageDocument } from "./packageDocument";

export interface IPackageClient<TClientData> {

  logger: ILogger;

  config: IProviderConfig,

  fetchPackage: (request: PackageRequest<TClientData>)
    => Promise<PackageDocument>;

}
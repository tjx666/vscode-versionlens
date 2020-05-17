import { PackageRequest } from "./packageRequest";
import { PackageDocument } from "./packageDocument";
import { IProviderConfig } from "presentation/providers";
import { ILogger } from "core/logging/definitions";

export interface IPackageClient<TClientData> {

  logger: ILogger;

  config: IProviderConfig,


  fetchPackage: (request: PackageRequest<TClientData>)
    => Promise<PackageDocument>;

}
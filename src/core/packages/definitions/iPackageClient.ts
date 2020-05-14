import { IProviderConfig } from "presentation/providers/definitions";
import { PackageRequest } from "../models/packageRequest";
import { PackageDocument } from "../models/packageDocument";

export interface IPackageClient<TClientConfig> {

  config: IProviderConfig,

  fetchPackage: (request: PackageRequest<TClientConfig>)
    => Promise<PackageDocument>;

}
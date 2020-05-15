import { IProviderOptions } from "core/packages";
import { PackageRequest } from "../models/packageRequest";
import { PackageDocument } from "../models/packageDocument";

export interface IPackageClient<TClientConfig> {

  options: IProviderOptions,

  fetchPackage: (request: PackageRequest<TClientConfig>)
    => Promise<PackageDocument>;

}
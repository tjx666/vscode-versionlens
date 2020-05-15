import { IPackageProviderOptions } from "core/packages";
import { PackageRequest } from "../models/packageRequest";
import { PackageDocument } from "../models/packageDocument";

export interface IPackageClient<TClientConfig> {

  options: IPackageProviderOptions,

  fetchPackage: (request: PackageRequest<TClientConfig>)
    => Promise<PackageDocument>;

}
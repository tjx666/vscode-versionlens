import { IPackageProviderOptions } from "core/packages";
import { PackageRequest } from "./packageRequest";
import { PackageDocument } from "./packageDocument";

export interface IPackageClient<TClientConfig> {

  options: IPackageProviderOptions,

  fetchPackage: (request: PackageRequest<TClientConfig>)
    => Promise<PackageDocument>;

}
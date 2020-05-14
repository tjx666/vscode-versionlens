import { PackageRequest } from "../models/packageRequest";
import { PackageDocument } from "../models/packageDocument";

export interface IPackageClient<TClientConfig> {

  fetchPackage: (request: PackageRequest<TClientConfig>)
    => Promise<PackageDocument>;

}
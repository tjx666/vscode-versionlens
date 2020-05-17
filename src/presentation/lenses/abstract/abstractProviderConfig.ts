import { VersionLensExtension } from "presentation/extension";
import { PackageFileFilter } from "core/packages";
import { IPackageClientOptions } from "core/packages/definitions/iPackageClientOptions";

export enum ProviderSupport {
  Releases = 'releases',
  Prereleases = 'prereleases',
  InstalledStatuses = 'installedStatuses'
}

export interface IProviderOptions extends IPackageClientOptions {
  supports: Array<ProviderSupport>;
  selector: PackageFileFilter;
}

export interface IProviderConfig {

  extension: VersionLensExtension;

  options: IProviderOptions;

}
import { PackageFileFilter } from 'core.packages';
import { IPackageClientOptions } from 'core.packages';

export enum ProviderSupport {
  Releases = 'releases',
  Prereleases = 'prereleases',
  InstalledStatuses = 'installedStatuses'
}

export interface IProviderOptions extends IPackageClientOptions {
  supports: Array<ProviderSupport>;
  selector: PackageFileFilter;
}

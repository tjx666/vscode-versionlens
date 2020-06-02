import { PackageFileFilter } from 'core.packages';
import { IPackageClientOptions } from 'core.packages';

import { ProviderSupport } from './eProviderSupport';

export interface IProviderOptions extends IPackageClientOptions {
  supports: Array<ProviderSupport>;
  selector: PackageFileFilter;
}

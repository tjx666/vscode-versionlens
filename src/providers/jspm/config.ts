import {
  PackageFileFilter,
  IPackageProviderOptions
} from "core/packages";
import { VersionLensExtension } from "presentation/extension";
import { NpmConfig } from '../npm/config';

export class JspmConfig
  extends NpmConfig
  implements IPackageProviderOptions {

  constructor(extension: VersionLensExtension) {
    super(extension);
  }

  get providerName(): string {
    return 'jspm';
  }

  get group(): Array<string> {
    return super.group;
  }

  get selector(): PackageFileFilter {
    return super.selector;
  }

}
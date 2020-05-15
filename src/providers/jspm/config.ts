import * as VsCodeTypes from "vscode";

import { NpmConfig } from '../npm/config';
import {
  PackageFileFilter,
  IProviderOptions
} from "core/packages";

export class JspmConfig
  extends NpmConfig
  implements IProviderOptions {

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration);
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
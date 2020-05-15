import * as VsCodeTypes from "vscode";

import { NpmConfig } from '../npm/config';

export class JspmConfig extends NpmConfig {

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration, 'jspm');
  }

}
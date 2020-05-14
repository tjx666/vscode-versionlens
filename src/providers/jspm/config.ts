import * as VsCodeTypes from "vscode";

import { NpmConfig } from '../npm/config';

// enum JspmContributions {
//   DependencyProperties = 'npm.dependencyProperties',
//   DistTagFilter = 'npm.distTagFilter',
// }

export class JspmConfig extends NpmConfig {

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration, 'jspm');
  }

}
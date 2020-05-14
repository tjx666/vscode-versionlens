import * as VsCodeTypes from 'vscode';

import { JspmVersionLensProvider } from './jspmVersionLensProvider';
import { JspmConfig } from './config';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  return new JspmVersionLensProvider(
    new JspmConfig(configuration)
  );
}
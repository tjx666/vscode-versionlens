import * as VsCodeTypes from 'vscode';

import { DubVersionLensProvider } from './dubVersionLensProvider';
import { DubConfig } from './config';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  return new DubVersionLensProvider(
    new DubConfig(configuration)
  );
}
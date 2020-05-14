import * as VsCodeTypes from 'vscode';

import { PubVersionLensProvider } from './pubVersionLensProvider';
import { PubConfig } from './config';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  return new PubVersionLensProvider(
    new PubConfig(configuration)
  );
}
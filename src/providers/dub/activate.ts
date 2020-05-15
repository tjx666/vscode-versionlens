import * as VsCodeTypes from 'vscode';

import { DubVersionLensProvider } from './dubVersionLensProvider';
import { DubConfig } from './config';
import { DubClient } from './clients/dubClient';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  const config = new DubConfig(configuration);

  return new DubVersionLensProvider(
    new DubClient(config, 0),
    config
  );
}
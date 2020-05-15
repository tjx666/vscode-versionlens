import * as VsCodeTypes from 'vscode';

import { PubVersionLensProvider } from './pubVersionLensProvider';
import { PubConfig } from './config';
import { PubClient } from './pubClient';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  const config = new PubConfig(configuration);
  const client = new PubClient(config, 0);
  return new PubVersionLensProvider(client, config);
}
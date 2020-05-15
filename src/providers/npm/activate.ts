import * as VsCodeTypes from 'vscode';

import { NpmVersionLensProvider } from './npmVersionLensProvider';
import { NpmConfig } from './config';
import { PacoteClient } from './clients/pacoteClient';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  const config = new NpmConfig(configuration);
  const client = new PacoteClient(config, 0);
  return new NpmVersionLensProvider(
    client,
    config
  );
}
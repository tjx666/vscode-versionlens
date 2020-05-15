import * as VsCodeTypes from 'vscode';

import { JspmVersionLensProvider } from './jspmVersionLensProvider';
import { JspmConfig } from './config';
import { PacoteClient } from 'providers/npm/clients/pacoteClient';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  const config = new JspmConfig(configuration);
  const client = new PacoteClient(config, 0);
  return new JspmVersionLensProvider(
    client,
    config
  );
}
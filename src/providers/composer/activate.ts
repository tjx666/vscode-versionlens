import * as VsCodeTypes from 'vscode';

import { ComposerVersionLensProvider } from './composerVersionLensProvider';
import { ComposerConfig } from './config';
import { ComposerClient } from './composerClient';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  const config = new ComposerConfig(configuration);
  return new ComposerVersionLensProvider(
    new ComposerClient(config, 0),
    config
  );
}
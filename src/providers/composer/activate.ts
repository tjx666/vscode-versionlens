import * as VsCodeTypes from 'vscode';

import { ComposerVersionLensProvider } from './composerVersionLensProvider';
import { ComposerConfig } from './config';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  return new ComposerVersionLensProvider(
    new ComposerConfig(configuration)
  );
}

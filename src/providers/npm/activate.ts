import * as VsCodeTypes from 'vscode';

import { NpmVersionLensProvider } from './npmVersionLensProvider';
import { NpmConfig } from './config';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  return new NpmVersionLensProvider(
    new NpmConfig(configuration)
  );
}
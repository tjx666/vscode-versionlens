import * as VsCodeTypes from 'vscode';

import { DotNetVersionLensProvider } from './dotnetVersionLensProvider';
import { DotNetConfig } from './config';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  return new DotNetVersionLensProvider(
    new DotNetConfig(configuration)
  );
}
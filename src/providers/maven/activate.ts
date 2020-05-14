import * as VsCodeTypes from 'vscode';

import { MavenVersionLensProvider } from './mavenVersionLensProvider';
import { MavenConfig } from './config';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  return new MavenVersionLensProvider(
    new MavenConfig(configuration)
  );
}
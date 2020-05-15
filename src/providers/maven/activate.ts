import * as VsCodeTypes from 'vscode';

import { MavenVersionLensProvider } from './mavenVersionLensProvider';
import { MavenConfig } from './config';
import { MvnClient } from './clients/mvnClient';
import { MavenClient } from './clients/mavenClient';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  const config = new MavenConfig(configuration);
  const mvnClient = new MvnClient(config, 0);
  const mavenClient = new MavenClient(config, 0);
  return new MavenVersionLensProvider(
    mvnClient,
    mavenClient,
    config
  );
}
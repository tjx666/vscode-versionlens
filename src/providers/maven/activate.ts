import * as VsCodeTypes from 'vscode';

import { MavenVersionLensProvider } from './mavenVersionLensProvider';
import { MavenConfig } from './config';
import { MvnClient } from './clients/mvnClient';
import { MavenClient } from './clients/mavenClient';
import { ILogger } from 'core/generic/logging';

export function activate(
  configuration: VsCodeTypes.WorkspaceConfiguration,
  logger: ILogger
) {
  const config = new MavenConfig(configuration);
  const mvnClient = new MvnClient(config, 0, logger);
  const mavenClient = new MavenClient(config, 0, logger);
  return new MavenVersionLensProvider(
    mvnClient,
    mavenClient,
    config,
    logger
  );
}
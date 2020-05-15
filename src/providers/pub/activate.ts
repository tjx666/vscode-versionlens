import * as VsCodeTypes from 'vscode';

import { PubVersionLensProvider } from './pubVersionLensProvider';
import { PubConfig } from './config';
import { PubClient } from './pubClient';
import { ILogger } from 'core/generic/logging';

export function activate(
  configuration: VsCodeTypes.WorkspaceConfiguration,
  logger: ILogger
) {
  const config = new PubConfig(configuration);
  const client = new PubClient(config, 0, logger);
  return new PubVersionLensProvider(
    client,
    config,
    logger
  );
}
import * as VsCodeTypes from 'vscode';

import { NpmVersionLensProvider } from './npmVersionLensProvider';
import { NpmConfig } from './config';
import { PacoteClient } from './clients/pacoteClient';
import { ILogger } from 'core/generic/logging';

export function activate(
  configuration: VsCodeTypes.WorkspaceConfiguration,
  logger: ILogger
) {
  const config = new NpmConfig(configuration);
  const client = new PacoteClient(config, 0, logger);
  return new NpmVersionLensProvider(
    client,
    config,
    logger
  );
}
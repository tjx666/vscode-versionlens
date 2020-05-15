import * as VsCodeTypes from 'vscode';

import { JspmVersionLensProvider } from './jspmVersionLensProvider';
import { JspmConfig } from './config';
import { PacoteClient } from 'providers/npm/clients/pacoteClient';
import { ILogger } from 'core/generic/logging';

export function activate(
  configuration: VsCodeTypes.WorkspaceConfiguration,
  logger: ILogger
) {
  const config = new JspmConfig(configuration);
  const client = new PacoteClient(config, 0, logger);
  return new JspmVersionLensProvider(
    client,
    config,
    logger
  );
}
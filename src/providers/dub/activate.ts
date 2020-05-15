import * as VsCodeTypes from 'vscode';

import { DubVersionLensProvider } from './dubVersionLensProvider';
import { DubConfig } from './config';
import { DubClient } from './clients/dubClient';
import { ILogger } from 'core/generic/logging';

export function activate(
  configuration: VsCodeTypes.WorkspaceConfiguration,
  logger: ILogger
) {
  const config = new DubConfig(configuration);

  return new DubVersionLensProvider(
    new DubClient(config, 0, logger),
    config,
    logger
  );
}
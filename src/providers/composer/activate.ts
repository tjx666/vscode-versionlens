import * as VsCodeTypes from 'vscode';

import { ComposerVersionLensProvider } from './composerVersionLensProvider';
import { ComposerConfig } from './config';
import { ComposerClient } from './composerClient';
import { ILogger } from 'core/generic/logging';

export function activate(
  configuration: VsCodeTypes.WorkspaceConfiguration,
  logger: ILogger
) {
  const config = new ComposerConfig(configuration);
  return new ComposerVersionLensProvider(
    new ComposerClient(config, 0, logger),
    config,
    logger
  );
}
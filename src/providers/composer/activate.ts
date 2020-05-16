import { ILogger } from 'core/logging';
import { AppConfig } from 'presentation/extension';

import { ComposerVersionLensProvider } from './composerVersionLensProvider';
import { ComposerConfig } from './config';
import { ComposerClient } from './composerClient';

export function activate(appConfig: AppConfig, logger: ILogger) {
  const config = new ComposerConfig(appConfig);
  const client = new ComposerClient(config, 0, logger);
  return new ComposerVersionLensProvider(
    client,
    config,
    logger
  );
}
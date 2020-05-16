import { ILogger } from 'core/logging';
import { AppConfig } from 'presentation/extension';

import { NpmVersionLensProvider } from './npmVersionLensProvider';
import { NpmConfig } from './config';
import { PacoteClient } from './clients/pacoteClient';

export function activate(appConfig: AppConfig, logger: ILogger) {
  const config = new NpmConfig(appConfig);
  const client = new PacoteClient(config, 0, logger);
  return new NpmVersionLensProvider(
    client,
    config,
    logger
  );
}
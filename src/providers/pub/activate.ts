import { ILogger } from 'core/logging';
import { AppConfig } from 'presentation/extension';

import { PubVersionLensProvider } from './pubVersionLensProvider';
import { PubConfig } from './config';
import { PubClient } from './pubClient';

export function activate(appConfig: AppConfig, logger: ILogger) {
  const config = new PubConfig(appConfig);
  const client = new PubClient(config, 0, logger);
  return new PubVersionLensProvider(
    client,
    config,
    logger
  );
}
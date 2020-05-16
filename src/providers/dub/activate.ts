import { ILogger } from 'core/logging';
import { AppConfig } from 'presentation/extension';

import { DubVersionLensProvider } from './dubVersionLensProvider';
import { DubConfig } from './config';
import { DubClient } from './clients/dubClient';

export function activate(appConfig: AppConfig, logger: ILogger) {
  const config = new DubConfig(appConfig);

  return new DubVersionLensProvider(
    new DubClient(config, 0, logger),
    config,
    logger
  );
}
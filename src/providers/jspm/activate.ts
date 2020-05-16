import { ILogger } from 'core/generic/logging';
import { PacoteClient } from 'providers/npm/clients/pacoteClient';
import { AppConfig } from 'presentation/configuration';

import { JspmVersionLensProvider } from './jspmVersionLensProvider';
import { JspmConfig } from './config';

export function activate(appConfig: AppConfig, logger: ILogger) {
  const config = new JspmConfig(appConfig);
  const client = new PacoteClient(config, 0, logger);
  return new JspmVersionLensProvider(
    client,
    config,
    logger
  );
}
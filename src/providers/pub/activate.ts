import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { PubVersionLensProvider } from './pubVersionLensProvider';
import { PubConfig } from './config';
import { PubClient } from './pubClient';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new PubConfig(extension);
  const client = new PubClient(config, 0, logger);
  return new PubVersionLensProvider(
    client,
    config,
    logger
  );
}
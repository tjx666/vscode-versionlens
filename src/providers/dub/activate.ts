import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { DubVersionLensProvider } from './dubVersionLensProvider';
import { DubConfig } from './config';
import { DubClient } from './clients/dubClient';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new DubConfig(extension);

  return new DubVersionLensProvider(
    new DubClient(config, 0, logger),
    config,
    logger
  );
}
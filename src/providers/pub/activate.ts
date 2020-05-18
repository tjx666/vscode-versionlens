import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { PubVersionLensProvider } from './pubVersionLensProvider';
import { PubConfig } from './config';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new PubConfig(extension);
  return new PubVersionLensProvider(config, logger);
}
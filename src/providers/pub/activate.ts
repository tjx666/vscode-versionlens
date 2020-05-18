import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { PubVersionLensProvider } from './pubProvider';
import { PubConfig } from './pubConfig';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new PubConfig(extension);
  return new PubVersionLensProvider(config, logger);
}
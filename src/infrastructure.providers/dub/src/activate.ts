import { ILogger } from 'core.logging';
import { VersionLensExtension } from 'presentation.extension';

import { DubVersionLensProvider } from './dubProvider';
import { DubConfig } from './dubConfig';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new DubConfig(extension);
  return new DubVersionLensProvider(config, logger);
}
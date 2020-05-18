import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { NpmVersionLensProvider } from './npmVersionLensProvider';
import { NpmConfig } from './config';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new NpmConfig(extension);
  return new NpmVersionLensProvider(config, logger);
}
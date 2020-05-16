import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { NpmVersionLensProvider } from './npmVersionLensProvider';
import { NpmConfig } from './config';
import { PacoteClient } from './clients/pacoteClient';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new NpmConfig(extension);
  const client = new PacoteClient(config, 0, logger);
  return new NpmVersionLensProvider(
    client,
    config,
    logger
  );
}
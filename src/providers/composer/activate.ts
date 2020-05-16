import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { ComposerVersionLensProvider } from './composerVersionLensProvider';
import { ComposerConfig } from './config';
import { ComposerClient } from './composerClient';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new ComposerConfig(extension);
  const client = new ComposerClient(config, 0, logger);
  return new ComposerVersionLensProvider(
    client,
    config,
    logger
  );
}
import { ILogger } from 'core/logging';
import { PacoteClient } from 'providers/npm/clients/pacoteClient';
import { VersionLensExtension } from 'presentation/extension';

import { JspmVersionLensProvider } from './jspmVersionLensProvider';
import { JspmConfig } from './config';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new JspmConfig(extension);
  const client = new PacoteClient(config, 0, logger);
  return new JspmVersionLensProvider(
    client,
    config,
    logger
  );
}
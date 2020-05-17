import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { NpmVersionLensProvider } from './npmVersionLensProvider';
import { NpmConfig } from './config';
import { NpmPackageClient } from './clients/npmPackageClient';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new NpmConfig(extension);
  const npmPackageClient = new NpmPackageClient(config, 0, logger);
  
  return new NpmVersionLensProvider(
    npmPackageClient,
    config,
    logger
  );
}
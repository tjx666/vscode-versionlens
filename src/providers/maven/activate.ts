import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { MavenVersionLensProvider } from './mavenVersionLensProvider';
import { MavenConfig } from './config';
import { MvnClient } from './clients/mvnClient';
import { MavenClient } from './clients/mavenClient';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new MavenConfig(extension);
  const mvnClient = new MvnClient(config, 0, logger);
  const mavenClient = new MavenClient(config, 0, logger);
  return new MavenVersionLensProvider(
    mvnClient,
    mavenClient,
    config,
    logger
  );
}
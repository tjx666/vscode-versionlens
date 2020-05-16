import { ILogger } from 'core/generic/logging';
import { AppConfig } from 'presentation/configuration';

import { MavenVersionLensProvider } from './mavenVersionLensProvider';
import { MavenConfig } from './config';
import { MvnClient } from './clients/mvnClient';
import { MavenClient } from './clients/mavenClient';

export function activate(appConfig: AppConfig, logger: ILogger) {
  const config = new MavenConfig(appConfig);
  const mvnClient = new MvnClient(config, 0, logger);
  const mavenClient = new MavenClient(config, 0, logger);
  return new MavenVersionLensProvider(
    mvnClient,
    mavenClient,
    config,
    logger
  );
}
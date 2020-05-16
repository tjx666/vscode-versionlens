import { ILogger } from 'core/logging';
import { AppConfig } from 'presentation/extension';

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
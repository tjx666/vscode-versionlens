import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { MavenVersionLensProvider } from './mavenVersionLensProvider';
import { MavenConfig } from './config';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new MavenConfig(extension);
  return new MavenVersionLensProvider(config, logger);
}
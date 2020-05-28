import { ILogger } from 'core.logging';
import { VersionLensExtension } from 'presentation.extension';

import { MavenVersionLensProvider } from './mavenProvider';
import { MavenConfig } from './mavenConfig';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new MavenConfig(extension);
  return new MavenVersionLensProvider(config, logger);
}
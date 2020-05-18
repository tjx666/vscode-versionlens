import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { DotNetVersionLensProvider } from './dotnetVersionLensProvider';
import { DotNetConfig } from './dotnetConfig';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new DotNetConfig(extension);
  return new DotNetVersionLensProvider(config, logger);
}
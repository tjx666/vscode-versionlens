import { ILogger } from 'core/logging';

import { VersionLensExtension } from 'presentation/extension';

import { ComposerVersionLensProvider } from './composerProvider';
import { ComposerConfig } from './composerConfig';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new ComposerConfig(extension);
  return new ComposerVersionLensProvider(config, logger);
}
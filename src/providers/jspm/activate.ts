import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';
import { JspmVersionLensProvider } from './jspmVersionLensProvider';
import { JspmConfig } from './jspmConfig';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new JspmConfig(extension);
  return new JspmVersionLensProvider(config, logger);
}
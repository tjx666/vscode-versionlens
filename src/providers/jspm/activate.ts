import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';
import { JspmVersionLensProvider } from './jspmVersionLensProvider';
import { JspmConfig } from './config';
import { NpmPackageClient } from 'providers/npm/clients/npmPackageClient';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new JspmConfig(extension);
  const client = new NpmPackageClient(config, 0, logger);
  return new JspmVersionLensProvider(
    client,
    config,
    logger
  );
}
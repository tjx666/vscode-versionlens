import { ILogger } from 'core/logging';
import { VersionLensExtension } from 'presentation/extension';

import { DotNetVersionLensProvider } from './dotnetVersionLensProvider';
import { DotNetConfig } from './config';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { NuGetPackageClient } from './clients/nugetPackageClient';

export function activate(extension: VersionLensExtension, logger: ILogger) {
  const config = new DotNetConfig(extension);

  return new DotNetVersionLensProvider(
    new NuGetPackageClient(config, 0, logger),
    new NuGetResourceClient(config, 0, logger),
    config,
    logger
  );

}
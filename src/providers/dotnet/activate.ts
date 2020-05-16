import { ILogger } from 'core/generic/logging';
import { AppConfig } from 'presentation/configuration';

import { DotNetVersionLensProvider } from './dotnetVersionLensProvider';
import { DotNetConfig } from './config';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { NuGetPackageClient } from './clients/nugetPackageClient';

export function activate(appConfig: AppConfig, logger: ILogger) {
  const config = new DotNetConfig(appConfig);

  return new DotNetVersionLensProvider(
    new NuGetPackageClient(config, 0, logger),
    new NuGetResourceClient(config, 0, logger),
    config,
    logger
  );

}
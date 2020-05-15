import * as VsCodeTypes from 'vscode';

import { DotNetVersionLensProvider } from './dotnetVersionLensProvider';
import { DotNetConfig } from './config';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { NuGetPackageClient } from './clients/nugetPackageClient';
import { ILogger } from 'core/generic/logging';

export function activate(
  configuration: VsCodeTypes.WorkspaceConfiguration,
  logger: ILogger
) {
  const config = new DotNetConfig(configuration);

  return new DotNetVersionLensProvider(
    new NuGetPackageClient(config, 0, logger),
    new NuGetResourceClient(config, 0, logger),
    config,
    logger
  );
}
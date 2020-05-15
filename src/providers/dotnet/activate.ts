import * as VsCodeTypes from 'vscode';

import { DotNetVersionLensProvider } from './dotnetVersionLensProvider';
import { DotNetConfig } from './config';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { NuGetPackageClient } from './clients/nugetPackageClient';

export function activate(configuration: VsCodeTypes.WorkspaceConfiguration) {
  const config = new DotNetConfig(configuration);

  return new DotNetVersionLensProvider(
    new NuGetPackageClient(config, 0),
    new NuGetResourceClient(config, 0),
    config
  );
}
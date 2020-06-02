import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'core.clients';
import { ProcessClient, createJsonClient, createProcessClient } from 'infrastructure.clients';
import { IProviderConfig, AbstractVersionLensProvider } from 'presentation.providers';

import { IDotNetContainerMap } from './definitions/iDotNetContainerMap';
import { DotNetContributions } from './definitions/eDotNetContributions';
import { DotNetVersionLensProvider } from './dotnetProvider';
import { DotNetConfig } from './dotnetConfig';
import { NugetOptions } from './options/nugetOptions';
import { DotNetCli } from './clients/dotnetCli';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { NuGetPackageClient } from './clients/nugetPackageClient';

export function configureContainer(
  container: AwilixContainer<IDotNetContainerMap>
): AbstractVersionLensProvider<IProviderConfig> {

  const containerMap = {

    // options
    nugetOpts: asFunction(
      extension => new NugetOptions(
        extension.config,
        DotNetContributions.Nuget
      )
    ).singleton(),

    dotnetCachingOpts: asFunction(
      extension => new CachingOptions(
        extension.config,
        DotNetContributions.Caching,
        'caching'
      )
    ).singleton(),

    dotnetHttpOpts: asFunction(
      extension => new HttpOptions(
        extension.config,
        DotNetContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    dotnetConfig: asFunction(
      (extension, dotnetCachingOpts, dotnetHttpOpts, nugetOpts) =>
        new DotNetConfig(
          extension,
          dotnetCachingOpts,
          dotnetHttpOpts,
          nugetOpts
        )
    ).singleton(),

    // cli
    dotnetProcess: asFunction(
      (dotnetCachingOpts, logger) =>
        createProcessClient(
          dotnetCachingOpts,
          logger.child({ namespace: 'dotnet process' })
        )
    ).singleton(),

    dotnetCli: asFunction(
      (dotnetConfig, dotnetProcess, logger) =>
        new DotNetCli(
          dotnetConfig,
          dotnetProcess,
          logger.child({ namespace: 'dotnet cli' })
        )
    ).singleton(),

    // clients
    dotnetJsonClient: asFunction(
      (dotnetCachingOpts, dotnetHttpOpts, logger) =>
        createJsonClient(
          {
            caching: dotnetCachingOpts,
            http: dotnetHttpOpts
          },
          logger.child({ namespace: 'dotnet request' })
        )
    ).singleton(),

    nugetClient: asFunction(
      (dotnetConfig, dotnetJsonClient, logger) =>
        new NuGetPackageClient(
          dotnetConfig,
          dotnetJsonClient,
          logger.child({ namespace: 'dotnet client' })
        )
    ).singleton(),

    nugetResClient: asFunction(
      (dotnetJsonClient, logger) =>
        new NuGetResourceClient(
          dotnetJsonClient,
          logger.child({ namespace: 'dotnet resource service' })
        )
    ).singleton(),

    // provider
    dotnetProvider: asFunction(
      (dotnetConfig, dotnetCli, nugetClient, nugetResClient, logger) =>
        new DotNetVersionLensProvider(
          dotnetConfig,
          dotnetCli,
          nugetClient,
          nugetResClient,
          logger.child({ namespace: 'dotnet provider' })
        )
    ).singleton(),
  };

  container.register(containerMap);

  return container.cradle.dotnetProvider;
}
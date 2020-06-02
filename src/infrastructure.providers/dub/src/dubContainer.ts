import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'core.clients';

import { createJsonClient } from 'infrastructure.clients';

import { IProviderConfig, AbstractVersionLensProvider } from 'presentation.providers';

import { DubContributions } from './definitions/eDubContributions';
import { IDubContainerMap } from './definitions/iDubContainerMap';
import { DubVersionLensProvider } from './dubProvider'
import { DubConfig } from './dubConfig';
import { DubClient } from './dubClient';

export function configureContainer(
  container: AwilixContainer<IDubContainerMap>
): AbstractVersionLensProvider<IProviderConfig> {

  const containerMap = {

    // options
    dubCachingOpts: asFunction(
      extension => new CachingOptions(
        extension.config,
        DubContributions.Caching,
        'caching'
      )
    ).singleton(),

    dubHttpOpts: asFunction(
      extension => new HttpOptions(
        extension.config,
        DubContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    dubConfig: asFunction(
      (extension, dubCachingOpts, dubHttpOpts) =>
        new DubConfig(extension, dubCachingOpts, dubHttpOpts)
    ).singleton(),

    // clients
    dubJsonClient: asFunction(
      (dubCachingOpts, dubHttpOpts, logger) =>
        createJsonClient(
          {
            caching: dubCachingOpts,
            http: dubHttpOpts
          },
          logger.child({ namespace: 'dub request' })
        )
    ).singleton(),

    dubClient: asFunction(
      (dubConfig, dubJsonClient, logger) =>
        new DubClient(
          dubConfig,
          dubJsonClient,
          logger.child({ namespace: 'dub client' })
        )
    ).singleton(),

    // provider
    dubProvider: asFunction(
      (dubConfig, dubClient, logger) =>
        new DubVersionLensProvider(
          dubConfig,
          dubClient,
          logger.child({ namespace: 'dub provider' })
        )
    ).singleton(),
  };

  container.register(containerMap)

  return container.cradle.dubProvider;
}
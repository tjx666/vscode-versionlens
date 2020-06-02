import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'core.clients';
import { IProviderConfig } from 'core.providers';

import { createJsonClient } from 'infrastructure.clients';

import { AbstractVersionLensProvider } from 'presentation.providers';

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
      rootConfig => new CachingOptions(
        rootConfig,
        DubContributions.Caching,
        'caching'
      )
    ).singleton(),

    dubHttpOpts: asFunction(
      rootConfig => new HttpOptions(
        rootConfig,
        DubContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    dubConfig: asFunction(
      (rootConfig, dubCachingOpts, dubHttpOpts) =>
        new DubConfig(rootConfig, dubCachingOpts, dubHttpOpts)
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
      (extension, dubClient, logger) =>
        new DubVersionLensProvider(
          extension,
          dubClient,
          logger.child({ namespace: 'dub provider' })
        )
    ).singleton(),
  };

  container.register(containerMap)

  return container.cradle.dubProvider;
}
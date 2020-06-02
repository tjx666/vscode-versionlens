import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'core.clients';

import { IProviderConfig, AbstractVersionLensProvider } from 'presentation.providers';

import { PubContributions } from './definitions/ePubContributions';
import { IPubContainerMap } from './definitions/iPubContainerMap';
import { PubVersionLensProvider } from './pubProvider'
import { PubConfig } from './pubConfig';
import { PubClient } from './pubClient';
import { createJsonClient } from 'infrastructure.clients';

export function configureContainer(
  container: AwilixContainer<IPubContainerMap>
): AbstractVersionLensProvider<IProviderConfig> {

  const containerMap = {

    // options
    pubCachingOpts: asFunction(
      extension => new CachingOptions(
        extension.config,
        PubContributions.Caching,
        'caching'
      )
    ).singleton(),

    pubHttpOpts: asFunction(
      extension => new HttpOptions(
        extension.config,
        PubContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    pubConfig: asFunction(
      (extension, pubCachingOpts, pubHttpOpts) =>
        new PubConfig(extension, pubCachingOpts, pubHttpOpts)
    ).singleton(),

    // clients
    pubJsonClient: asFunction(
      (pubCachingOpts, pubHttpOpts, logger) =>
        createJsonClient(
          {
            caching: pubCachingOpts,
            http: pubHttpOpts
          },
          logger.child({ namespace: 'pub request' })
        )
    ).singleton(),

    pubClient: asFunction(
      (pubConfig, pubJsonClient, logger) =>
        new PubClient(
          pubConfig,
          pubJsonClient,
          logger.child({ namespace: 'pub client' })
        )
    ).singleton(),

    // provider
    pubProvider: asFunction(
      (pubConfig, pubClient, logger) =>
        new PubVersionLensProvider(
          pubConfig,
          pubClient,
          logger.child({ namespace: 'pub provider' })
        )
    ).singleton(),
  };

  container.register(containerMap)

  return container.cradle.pubProvider;
}
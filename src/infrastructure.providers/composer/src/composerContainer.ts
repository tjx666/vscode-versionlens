import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'core.clients';

import { createJsonClient } from 'infrastructure.clients';

import { IProviderConfig, AbstractVersionLensProvider } from 'presentation.providers';

import { ComposerContributions } from './definitions/eComposerContributions';
import { IComposerContainerMap } from './definitions/iComposerContainerMap';
import { ComposerVersionLensProvider } from './composerProvider'
import { ComposerConfig } from './composerConfig';
import { ComposerClient } from './composerClient';

export function configureContainer(
  container: AwilixContainer<IComposerContainerMap>
): AbstractVersionLensProvider<IProviderConfig> {

  const containerMap = {

    // options
    composerCachingOpts: asFunction(
      extension => new CachingOptions(
        extension.config,
        ComposerContributions.Caching,
        'caching'
      )
    ).singleton(),

    composerHttpOpts: asFunction(
      extension => new HttpOptions(
        extension.config,
        ComposerContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    composerConfig: asFunction(
      (extension, composerCachingOpts, composerHttpOpts) =>
        new ComposerConfig(extension, composerCachingOpts, composerHttpOpts)
    ).singleton(),

    // clients
    composerJsonClient: asFunction(
      (composerCachingOpts, composerHttpOpts, logger) =>
        createJsonClient(
          {
            caching: composerCachingOpts,
            http: composerHttpOpts
          },
          logger.child({ namespace: 'composer request' })
        )
    ).singleton(),

    composerClient: asFunction(
      (composerConfig, composerJsonClient, logger) =>
        new ComposerClient(
          composerConfig,
          composerJsonClient,
          logger.child({ namespace: 'composer client' })
        )
    ).singleton(),

    // provider
    composerProvider: asFunction(
      (composerConfig, composerClient, logger) =>
        new ComposerVersionLensProvider(
          composerConfig,
          composerClient,
          logger.child({ namespace: 'composer provider' })
        )
    ).singleton(),
  };

  container.register(containerMap)

  return container.cradle.composerProvider;
}
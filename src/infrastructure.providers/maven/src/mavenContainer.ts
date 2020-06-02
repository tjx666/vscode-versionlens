import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'core.clients';

import { IProviderConfig, AbstractVersionLensProvider } from 'presentation.providers';

import { MavenConfig } from './mavenConfig';
import { MavenVersionLensProvider } from './mavenProvider'
import { MavenContributions } from './definitions/eMavenContributions';
import { IMavenContainerMap } from './definitions/iMavenContainerMap';
import { MvnCli } from './clients/mvnCli';
import { MavenClient } from './clients/mavenClient';
import { createHttpClient, ProcessClient, createProcessClient } from 'infrastructure.clients';

export function configureContainer(
  container: AwilixContainer<IMavenContainerMap>
): AbstractVersionLensProvider<IProviderConfig> {

  const containerMap = {

    // options
    mavenCachingOpts: asFunction(
      extension => new CachingOptions(
        extension.config,
        MavenContributions.Caching,
        'caching'
      )
    ).singleton(),

    mavenHttpOpts: asFunction(
      extension => new HttpOptions(
        extension.config,
        MavenContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    mavenConfig: asFunction(
      (extension, mavenCachingOpts, mavenHttpOpts) =>
        new MavenConfig(
          extension,
          mavenCachingOpts,
          mavenHttpOpts
        )
    ).singleton(),

    // cli
    mvnProcess: asFunction(
      (mavenCachingOpts, logger) =>
        createProcessClient(
          mavenCachingOpts,
          logger.child({ namespace: 'maven mvn process' })
        )
    ).singleton(),

    mvnCli: asFunction(
      (mavenConfig, mvnProcess, logger) =>
        new MvnCli(
          mavenConfig,
          mvnProcess,
          logger.child({ namespace: 'maven mvn cli' })
        )
    ).singleton(),

    // clients
    mavenHttpClient: asFunction(
      (mavenCachingOpts, mavenHttpOpts, logger) =>
        createHttpClient(
          {
            caching: mavenCachingOpts,
            http: mavenHttpOpts
          },
          logger.child({ namespace: 'maven request' })
        )
    ).singleton(),

    mavenClient: asFunction(
      (mavenConfig, mavenHttpClient, logger) =>
        new MavenClient(
          mavenConfig,
          mavenHttpClient,
          logger.child({ namespace: 'maven client' })
        )
    ).singleton(),

    // provider
    mavenProvider: asFunction(
      (mavenConfig, mvnCli, mavenClient, logger) =>
        new MavenVersionLensProvider(
          mavenConfig,
          mvnCli,
          mavenClient,
          logger.child({ namespace: 'maven provider' })
        )
    ).singleton(),
  };

  container.register(containerMap);

  return container.cradle.mavenProvider;
}
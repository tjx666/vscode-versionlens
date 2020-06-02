import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'core.clients';
import { IProviderConfig } from 'core.providers';

import { createHttpClient, createProcessClient } from 'infrastructure.clients';

import { AbstractVersionLensProvider } from 'presentation.providers';

import { MavenContributions } from './definitions/eMavenContributions';
import { IMavenContainerMap } from './definitions/iMavenContainerMap';
import { MvnCli } from './clients/mvnCli';
import { MavenClient } from './clients/mavenClient';
import { MavenConfig } from './mavenConfig';
import { MavenVersionLensProvider } from './mavenProvider'

export function configureContainer(
  container: AwilixContainer<IMavenContainerMap>
): AbstractVersionLensProvider<IProviderConfig> {

  const containerMap = {

    // options
    mavenCachingOpts: asFunction(
      rootConfig => new CachingOptions(
        rootConfig,
        MavenContributions.Caching,
        'caching'
      )
    ).singleton(),

    mavenHttpOpts: asFunction(
      rootConfig => new HttpOptions(
        rootConfig,
        MavenContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    mavenConfig: asFunction(
      (rootConfig, mavenCachingOpts, mavenHttpOpts) =>
        new MavenConfig(
          rootConfig,
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
      (extension, mvnCli, mavenClient, logger) =>
        new MavenVersionLensProvider(
          extension,
          mvnCli,
          mavenClient,
          logger.child({ namespace: 'maven provider' })
        )
    ).singleton(),
  };

  container.register(containerMap);

  return container.cradle.mavenProvider;
}
import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'core.clients';

import { IProviderConfig, AbstractVersionLensProvider } from 'presentation.providers';

import { NpmConfig } from './npmConfig';
import { NpmVersionLensProvider } from './npmProvider'
import { NpmContributions } from './definitions/eNpmContributions';
import { INpmContainerMap } from './definitions/iNpmContainerMap';
import { GitHubOptions } from './options/githubOptions';
import { NpmPackageClient } from './clients/npmPackageClient';
import { PacoteClient } from './clients/pacoteClient';
import { GitHubClient } from './clients/githubClient';
import { createJsonClient } from 'infrastructure.clients';

export function configureContainer(
  container: AwilixContainer<INpmContainerMap>
): AbstractVersionLensProvider<IProviderConfig> {

  const containerMap = {

    // options
    npmCachingOpts: asFunction(
      extension => new CachingOptions(
        extension.config,
        NpmContributions.Caching,
        'caching'
      )
    ).singleton(),

    npmHttpOpts: asFunction(
      extension => new HttpOptions(
        extension.config,
        NpmContributions.Http,
        'http'
      )
    ).singleton(),

    npmGitHubOpts: asFunction(
      extension => new GitHubOptions(
        extension.config,
        NpmContributions.Github,
        'github'
      )
    ).singleton(),

    // config
    npmConfig: asFunction(
      (extension, npmCachingOpts, npmHttpOpts, npmGitHubOpts) =>
        new NpmConfig(extension, npmCachingOpts, npmHttpOpts, npmGitHubOpts)
    ).singleton(),

    // clients
    githubJsonClient: asFunction(
      (npmCachingOpts, npmHttpOpts, logger) =>
        createJsonClient(
          {
            caching: npmCachingOpts,
            http: npmHttpOpts
          },
          logger.child({ namespace: 'npm request' })
        )
    ).singleton(),

    githubClient: asFunction(
      (npmConfig, githubJsonClient, logger) =>
        new GitHubClient(
          npmConfig,
          githubJsonClient,
          logger.child({ namespace: 'npm github' })
        )
    ).singleton(),

    pacoteClient: asFunction(
      (npmConfig, logger) =>
        new PacoteClient(
          npmConfig,
          logger.child({ namespace: 'pacote client' })
        )
    ).singleton(),

    npmClient: asFunction(
      (npmConfig, githubClient, pacoteClient, logger) =>
        new NpmPackageClient(
          npmConfig,
          pacoteClient,
          githubClient,
          logger.child({ namespace: 'npm client' })
        )
    ).singleton(),

    // provider
    npmProvider: asFunction(
      (npmConfig, npmClient, logger) =>
        new NpmVersionLensProvider(
          npmConfig,
          npmClient,
          logger.child({ namespace: 'npm provider' })
        )
    ).singleton(),

  };

  container.register(containerMap);

  return container.cradle.npmProvider;
}
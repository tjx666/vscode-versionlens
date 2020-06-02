import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'core.clients';

import { IProviderConfig, AbstractVersionLensProvider } from 'presentation.providers';

import { JspmConfig } from './jspmConfig';
import { JspmVersionLensProvider } from './jspmProvider'
import { IJspmContainerMap } from './definitions/iJspmContainerMap';
import { createJsonClient } from 'infrastructure.clients';
import {
  NpmContributions,
  PacoteClient,
  NpmPackageClient,
  GitHubClient,
  GitHubOptions
} from 'infrastructure.providers.npm';

export function configureContainer(
  container: AwilixContainer<IJspmContainerMap>
): AbstractVersionLensProvider<IProviderConfig> {

  const containerMap = {

    // options
    jspmCachingOpts: asFunction(
      extension => new CachingOptions(
        extension.config,
        NpmContributions.Caching,
        'caching'
      )
    ).singleton(),

    jspmHttpOpts: asFunction(
      extension => new HttpOptions(
        extension.config,
        NpmContributions.Http,
        'http'
      )
    ).singleton(),

    jspmGitHubOpts: asFunction(
      extension => new GitHubOptions(
        extension.config,
        NpmContributions.Github,
        'github'
      )
    ).singleton(),

    // config
    jspmConfig: asFunction(
      (extension, jspmCachingOpts, jspmHttpOpts, jspmGitHubOpts) =>
        new JspmConfig(extension, jspmCachingOpts, jspmHttpOpts, jspmGitHubOpts)
    ).singleton(),

    // clients
    githubJsonClient: asFunction(
      (jspmCachingOpts, jspmHttpOpts, logger) =>
        createJsonClient(
          {
            caching: jspmCachingOpts,
            http: jspmHttpOpts
          },
          logger.child({ namespace: 'jspm request' })
        )
    ).singleton(),

    githubClient: asFunction(
      (jspmConfig, githubJsonClient, logger) =>
        new GitHubClient(
          jspmConfig,
          githubJsonClient,
          logger.child({ namespace: 'jspm github' })
        )
    ).singleton(),

    pacoteClient: asFunction(
      (jspmConfig, logger) =>
        new PacoteClient(
          jspmConfig,
          logger.child({ namespace: 'pacote client' })
        )
    ).singleton(),

    jspmClient: asFunction(
      (jspmConfig, githubClient, pacoteClient, logger) =>
        new NpmPackageClient(
          jspmConfig,
          pacoteClient,
          githubClient,
          logger.child({ namespace: 'jspm client' })
        )
    ).singleton(),

    // provider
    jspmProvider: asFunction(
      (jspmConfig, jspmClient, logger) =>
        new JspmVersionLensProvider(
          jspmConfig,
          jspmClient,
          logger.child({ namespace: 'jspm provider' })
        )
    ).singleton(),

  };

  container.register(containerMap);

  return container.cradle.jspmProvider;
}
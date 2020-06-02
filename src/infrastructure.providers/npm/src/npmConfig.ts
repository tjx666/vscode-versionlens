import { ICachingOptions, IHttpOptions } from 'core.clients';
import { IFrozenOptions } from 'core.configuration';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from 'core.providers';

import { GitHubOptions } from './options/githubOptions';
import { NpmContributions } from './definitions/eNpmContributions';

export class NpmConfig extends AbstractProviderConfig {

  options: IProviderOptions = {
    providerName: 'npm',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
      ProviderSupport.InstalledStatuses,
    ],
    selector: {
      language: 'json',
      scheme: 'file',
      pattern: '**/package.json',
    }
  };

  caching: ICachingOptions;

  http: IHttpOptions;

  github: GitHubOptions;

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions,
    github: GitHubOptions,
  ) {
    super(config);

    this.caching = caching;
    this.http = http;
    this.github = github;
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(NpmContributions.DependencyProperties);
  }

  get distTagFilter(): Array<string> {
    return this.config.get(NpmContributions.DistTagFilter);
  }

}
import { ICachingOptions, IHttpOptions } from 'core.clients';
import { VersionLensExtension } from 'presentation.extension';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from 'presentation.providers';

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
    extension: VersionLensExtension,
    caching: ICachingOptions,
    http: IHttpOptions,
    github: GitHubOptions,
  ) {
    super(extension);

    this.caching = caching;
    this.http = http;
    this.github = github;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(NpmContributions.DependencyProperties);
  }

  get distTagFilter(): Array<string> {
    return this.extension.config.get(NpmContributions.DistTagFilter);
  }

}
import { CachingOptions, ICachingOptions } from 'core/clients';
import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from "presentation/providers";

import { GitHubOptions } from './options/githubOptions';

enum NpmContributions {
  Caching = 'npm.caching',
  Github = 'npm.github',
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

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

  github: GitHubOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      NpmContributions.Caching,
      'caching'
    );

    this.github = new GitHubOptions(
      extension.config,
      NpmContributions.Github,
      'github'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(NpmContributions.DependencyProperties);
  }

  get distTagFilter(): Array<string> {
    return this.extension.config.get(NpmContributions.DistTagFilter);
  }

}

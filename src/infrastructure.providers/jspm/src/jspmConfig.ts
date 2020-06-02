import { ICachingOptions, IHttpOptions } from 'core.clients';
import { NpmConfig, GitHubOptions } from 'infrastructure.providers.npm';
import { VersionLensExtension } from 'presentation.extension';

export class JspmConfig extends NpmConfig {

  constructor(
    extension: VersionLensExtension,
    caching: ICachingOptions,
    http: IHttpOptions,
    github: GitHubOptions
  ) {
    super(extension, caching, http, github);
    this.options.providerName = 'jspm';
  }

}
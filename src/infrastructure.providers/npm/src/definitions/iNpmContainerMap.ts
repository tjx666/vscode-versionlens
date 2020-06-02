import { ICachingOptions, IHttpOptions, IJsonHttpClient } from 'core.clients';

import { NpmConfig } from '../npmConfig';
import { GitHubOptions } from '../options/githubOptions';
import { NpmVersionLensProvider } from '../npmProvider'
import { NpmPackageClient } from '../clients/npmPackageClient';
import { PacoteClient } from '../clients/pacoteClient';
import { GitHubClient } from '../clients/githubClient';

export interface INpmContainerMap {

  // config
  npmConfig: NpmConfig,

  // options
  npmCachingOpts: ICachingOptions,

  npmHttpOpts: IHttpOptions,

  npmGitHubOpts: GitHubOptions,

  // clients
  githubJsonClient: IJsonHttpClient,

  pacoteClient: PacoteClient,

  githubClient: GitHubClient,

  npmClient: NpmPackageClient,

  // provider
  npmProvider: NpmVersionLensProvider
}
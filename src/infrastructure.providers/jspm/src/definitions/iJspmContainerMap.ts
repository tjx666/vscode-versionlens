import { ICachingOptions, IHttpOptions, IJsonHttpClient } from 'core.clients';

import { JspmConfig } from '../jspmConfig';
import { JspmVersionLensProvider } from '../jspmProvider'
import {
  GitHubOptions,
  PacoteClient,
  GitHubClient,
  NpmPackageClient
} from 'infrastructure.providers.npm';

export interface IJspmContainerMap {

  // config
  jspmConfig: JspmConfig,

  // options
  jspmCachingOpts: ICachingOptions,

  jspmHttpOpts: IHttpOptions,

  jspmGitHubOpts: GitHubOptions,

  // clients
  githubJsonClient: IJsonHttpClient,

  pacoteClient: PacoteClient,

  githubClient: GitHubClient,

  jspmClient: NpmPackageClient,

  // provider
  jspmProvider: JspmVersionLensProvider
}
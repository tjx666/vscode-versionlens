import { ICachingOptions, IHttpOptions, IJsonHttpClient } from 'core.clients';

import { ComposerConfig } from '../composerConfig';
import { ComposerVersionLensProvider } from '../composerProvider';
import { ComposerClient } from '../composerClient';

export interface IComposerContainerMap {

  // options
  composerCachingOpts: ICachingOptions,

  composerHttpOpts: IHttpOptions,

  // config
  composerConfig: ComposerConfig,

  // clients
  composerJsonClient: IJsonHttpClient,

  composerClient: ComposerClient,

  // provider
  composerProvider: ComposerVersionLensProvider

}
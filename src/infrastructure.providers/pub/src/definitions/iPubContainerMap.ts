import { ICachingOptions, IHttpOptions, IJsonHttpClient } from 'core.clients';

import { PubConfig } from '../pubConfig';
import { PubClient } from '../pubClient';
import { PubVersionLensProvider } from '../pubProvider';

export interface IPubContainerMap {

  // options
  pubCachingOpts: ICachingOptions,

  pubHttpOpts: IHttpOptions,

  // config
  pubConfig: PubConfig,

  // clients
  pubJsonClient: IJsonHttpClient,

  pubClient: PubClient,

  // provider
  pubProvider: PubVersionLensProvider

}
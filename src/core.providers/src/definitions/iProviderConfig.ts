import { ICachingOptions, IHttpOptions } from 'core.clients';

import { IProviderOptions } from "./iProviderOptions";

export interface IProviderConfig {

  options: IProviderOptions;

  caching: ICachingOptions;

  http: IHttpOptions;

}
import { IFrozenRepository } from 'core.generics';

export enum CachingContributions {
  CacheDuration = 'duration',
}

export interface ICachingOptions extends IFrozenRepository {

  config: IFrozenRepository;

  duration: number;

}

export enum HttpContributions {
  StrictSSL = 'strictSSL'
}

export interface IHttpOptions extends IFrozenRepository {

  config: IFrozenRepository;

  strictSSL: boolean;

}

export type HttpRequestOptions = {

    caching: ICachingOptions,

    http: IHttpOptions,

}
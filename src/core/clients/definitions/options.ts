import { IFrozenRespository } from "core/generic/repositories";

export enum CachingContributions {
  CacheDuration = 'duration',
}

export interface ICachingOptions extends IFrozenRespository {

  config: IFrozenRespository;

  duration: number;
  
}

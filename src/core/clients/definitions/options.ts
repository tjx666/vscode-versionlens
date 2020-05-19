import { IFrozenRespository } from "core/generics";

export enum CachingContributions {
  CacheDuration = 'duration',
}

export interface ICachingOptions extends IFrozenRespository {

  config: IFrozenRespository;

  duration: number;
  
}

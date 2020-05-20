import { IFrozenRepository } from "core/generics";

export enum CachingContributions {
  CacheDuration = 'duration',
}

export interface ICachingOptions extends IFrozenRepository {

  config: IFrozenRepository;

  duration: number;

}
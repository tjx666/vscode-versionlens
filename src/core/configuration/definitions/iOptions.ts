import { IRepository, IFrozenRespository } from "core/generic/repositories";

export interface IOptions extends IRepository {

  getOrDefault<T>(key: string, defaultValue: T): T;

}

export interface IFrozenOptions extends IFrozenRespository { }
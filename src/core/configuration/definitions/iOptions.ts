import { IRepository, IFrozenRespository } from "core/generics";

export interface IOptions extends IRepository {

  getOrDefault<T>(key: string, defaultValue: T): T;

}

export interface IFrozenOptions extends IFrozenRespository { }
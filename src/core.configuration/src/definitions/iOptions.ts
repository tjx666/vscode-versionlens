import { IFrozenRepository } from 'core.generics';

export interface IOptions extends IFrozenRepository { }

export interface IOptionsWithDefaults extends IOptions {

  getOrDefault<T>(key: string, defaultValue: T): T;

}
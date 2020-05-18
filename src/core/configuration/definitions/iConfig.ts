import { IRootConfig } from "./iRootConfig";

export interface IConfig extends IRootConfig {

  getOrDefault<T>(key: string, defaultValue: T): T;

}
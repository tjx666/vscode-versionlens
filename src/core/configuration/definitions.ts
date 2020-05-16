export interface IRootConfig {

  get<T>(key: string): T;

}

export interface IConfig extends IRootConfig {

  getOrDefault<T>(key: string, defaultValue: T): T;

}
export interface IConfig {

  get<T>(key: string, defaultValue: T): T;

}
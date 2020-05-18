import { IConfig, IRootConfig } from "core/configuration";

//TODO implement a snapshot config for request lifetime ability

export abstract class AbstractConfig implements IConfig {

  protected key: string;

  protected defaultKey: string;

  protected config: IRootConfig;

  constructor(key: string, configuration: IRootConfig, defaultKey?: string) {
    this.key = (key.length > 0) ? key + '.' : '';
    this.config = configuration;
    this.defaultKey = defaultKey;
  }

  get<T>(key: string): T {
    return this.config.get(`${this.key}${key}`);
  }

  getOrDefault<T>(key: string, defaultValue: T): T {
    // attempt to get key value
    const configValue: T = this.config.get(`${this.key}${key}`);

    // return key value
    if (configValue !== null) return configValue;

    // attempt to get default key value
    let defaultKeyValue: T;
    if (this.defaultKey !== null) {
      defaultKeyValue = this.config.get(`${this.defaultKey}.${key}`);
    }

    // return default key value
    if (defaultKeyValue !== null) return defaultKeyValue;

    // return arg default value
    return defaultValue;
  }

}
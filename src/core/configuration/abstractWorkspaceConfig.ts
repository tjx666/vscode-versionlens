import { IConfig } from "core/configuration";

export abstract class AbstractWorkspaceConfig implements IConfig {

  private configuration: IConfig;

  constructor(configuration: IConfig) {
    this.configuration = configuration;
  }

  get<T>(key: string): T {
    return this.configuration.get(key);
  }

  getOrDefault<T>(key: string, defaultValue: T): T {
    const configValue: T = this.configuration.get(key);
    if (configValue === undefined) {
      return defaultValue;
    }
    return configValue;
  }

}
import { IConfig } from "core/configuration";

export abstract class WorkspaceConfig implements IConfig {

  configuration: IConfig;

  constructor(configuration: IConfig) {
    this.configuration = configuration;
  }

  get<T>(key: string): T {
    return this.configuration.get(key);
  }

  getOrDefault<T>(key: string, defaultValue: T): T {
    return this.configuration.get(key) || defaultValue;
  }

}
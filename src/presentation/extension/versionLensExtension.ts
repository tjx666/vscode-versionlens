import { AppConfig } from "presentation/configuration";
import { VersionLensState } from "presentation/extension";
import { ILogger } from 'core/generic/logging';

export enum SuggestionIndicators {
  Update = '\u2191',
  Revert = '\u2193',
  OpenNewWindow = '\u29C9',
}

export class VersionLensExtension {

  appConfig: AppConfig;

  logger: ILogger;

  state: VersionLensState;

  extensionName: string;

  constructor(appConfig: AppConfig, logger: ILogger) {
    this.extensionName = "versionlens";
    this.appConfig = appConfig;
    this.logger = logger;
    this.state = new VersionLensState(appConfig);
  }

}

let _extensionSingleton = null;
export default _extensionSingleton;

export function registerExtension(appConfig: AppConfig, logger: ILogger): VersionLensExtension {
  _extensionSingleton = new VersionLensExtension(appConfig, logger);
  return _extensionSingleton;
}

// todo change how this is accessed
export function getExtension(): VersionLensExtension {
  return _extensionSingleton;
}
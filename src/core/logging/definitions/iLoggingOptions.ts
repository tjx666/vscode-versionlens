import { LogLevelTypes } from "./iLogger";

export interface ILoggingOptions {

  level: LogLevelTypes;

  timestampFormat: string;

}
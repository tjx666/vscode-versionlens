import { ILogger } from "./iLogger";

export interface ILoggerProvider {

  createLogger(category: string): ILogger;

}
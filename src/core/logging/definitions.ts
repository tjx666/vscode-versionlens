export enum LogLevelTypes {
  Verbose = "verbose",
  Debug = "debug",
  Info = "info",
  Error = "fail",
}

export interface ILogger {

  log(
    level: LogLevelTypes,
    message: string,
    ...splats: any
  ): void;

  info(message: string, ...splats: any): void;

  debug(message: string, ...splats: any): void;

  error(message: string, ...splats: any): void;

  verbose(message: string, ...splats: any): void;

}
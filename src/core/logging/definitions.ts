export enum LogLevelTypes {
  // Trace = "trce",
  Debug = "dbug",
  Info = "info",
  // Warn = "warn",
  Error = "fail",
  // Crit = "crit",
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

}
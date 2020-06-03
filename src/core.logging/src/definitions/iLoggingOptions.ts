import { IFrozenOptions } from "core.configuration";

import { LogLevelTypes } from "./iLogger";

export interface ILoggingOptions extends IFrozenOptions {

  level: LogLevelTypes;

  timestampFormat: string;

}
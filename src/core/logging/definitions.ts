export interface ILogger {
  append(value: string): void;
  appendLine(value: string): void;
}
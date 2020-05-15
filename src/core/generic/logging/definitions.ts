export interface ILogger {
  append(value: string): void;
  appendLine(value: string): void;
}


// export interface ILogger {

  // LogLevel logLevel, 
  // EventId eventId, 
  // TState state, 
  // Error error, 
  // Func<TState, Error, string> formatter
// }
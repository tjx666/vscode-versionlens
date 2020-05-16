// export interface ExecuteCommand<T> {
//   (command: string, ...rest: any[]): Promise<T | undefined>;
// }

export class VsCodePaletteState<T> {

  private key: string;
  // private executeCommand: ExecuteCommand<T>;
  private _value: T;

  constructor(
    key: string,
    defaultValue: T
  ) {
    this.key = key;
    // this.executeCommand = executeCommand;
    this.change(defaultValue);
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    this.change(newValue);
  }

  change(newValue: T): Promise<T> {
    this._value = newValue;
    const { commands } = require('vscode');
    return commands.executeCommand(
      'setContext',
      this.key,
      newValue
    );
  }

}
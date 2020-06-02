// vscode references
import * as VsCodeTypes from 'vscode';

const { Transport } = require('winston');

const MESSAGE = Symbol.for('message');

class OutputChannelTransport extends Transport {

  outputChannel: VsCodeTypes.OutputChannel;

  constructor(outputChannel: VsCodeTypes.OutputChannel, transportOptions) {
    super(transportOptions);
    this.outputChannel = outputChannel;
  }

  log(entry, callback) {

    setImmediate(() => {
      this.emit('logged', entry)

      this.outputChannel.appendLine(`${entry[MESSAGE]}`);
    });

    callback();
  }

}

export function createOutputChannelTransport(
  channel: VsCodeTypes.OutputChannel,
  transportOptions
) {
  return new OutputChannelTransport(channel, transportOptions);
}
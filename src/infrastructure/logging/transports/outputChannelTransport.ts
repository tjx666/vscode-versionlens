// vscode references
import * as VsCodeTypes from 'vscode';

const { Transport } = require('winston');

const MESSAGE = Symbol.for('message');

class OutputChannelTransport extends Transport {

  channel: VsCodeTypes.OutputChannel;

  constructor(channel: VsCodeTypes.OutputChannel, transportOptions) {
    super(transportOptions);
    this.channel = channel;
  }

  log(entry, callback) {

    setImmediate(() => {
      this.emit('logged', entry)

      this.channel.appendLine(`${entry[MESSAGE]}`);
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
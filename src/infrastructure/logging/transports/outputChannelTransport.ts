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
      this.channel.appendLine(`${entry[MESSAGE]}`);

      this.emit('logged', entry)
    });

    callback();
  }

  // clear() {
  //   this.channel.clear();
  // }

}

export function createOutputChannelTransport(channelName, transportOptions) {
  const { window } = require('vscode');
  const channel = window.createOutputChannel(
    channelName
  );

  return new OutputChannelTransport(channel, transportOptions);
}
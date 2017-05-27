import appSettings from 'common/appSettings';
import * as CustomCommands from './commands';
import * as InternalCommands from './internal';

export default function register() {
  const { commands } = require('vscode');

  function mapCommand(commandName, index) {
    const mapObject = this
    const id = `${appSettings.extensionName}.${commandName}`;
    const method = mapObject[commandName];
    return commands.registerCommand(id, method);
  }

  return [
    ...Object.keys(InternalCommands).map(mapCommand.bind(InternalCommands)),
    ...Object.keys(CustomCommands).map(mapCommand.bind(CustomCommands))
  ];
}
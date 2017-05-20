import appSettings from '../common/appSettings';
import * as CustomCommands from './commands';

const { commands } = require('vscode');

export default Object.keys(CustomCommands)
  .map(commandName => {
    return commands.registerCommand(
      `${appSettings.extensionName}.${commandName}`,
      CustomCommands[commandName]
    );
  });
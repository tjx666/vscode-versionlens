import { commands } from 'vscode';
import appSettings from '../common/appSettings';
import * as CustomCommands from './commands';

export default Object.keys(CustomCommands)
  .map(commandName => {
    return commands.registerCommand(
      `${appSettings.extensionName}.${commandName}`,
      CustomCommands[commandName]
    );
  });
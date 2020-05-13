import registerCommands from './presentation/commands/register'
import subscribeToEditorEvents from './presentation/editor/events'
import versionlensProviders from './providers/versionLensProviders'

export function activate(context) {
  const { languages, window } = require('vscode');
  const disposables = [];

  versionlensProviders.forEach(provider => {
    disposables.push(
      languages.registerCodeLensProvider(
        provider.selector,
        provider
      )
    );
  });

  registerCommands()
    .forEach(command => {
      disposables.push(command);
    });

  context.subscriptions.push(...disposables);

  subscribeToEditorEvents();
}
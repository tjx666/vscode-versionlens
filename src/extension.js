import registerCommands from './presentation/commands/register'
import subscribeToEditorEvents from './presentation/editor/events'
import codeLensProviders from './providers/codeLensProviders'

export function activate(context) {
  const { languages } = require('vscode');
  const disposables = [];

  codeLensProviders.forEach(provider => {
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
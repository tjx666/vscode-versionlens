import registerCommands from 'presentation/commands/register';
import subscribeToEditorEvents from 'presentation/editor/events';
import { AbstractVersionLensProvider } from 'presentation/providers/abstract/abstractVersionLensProvider';
import versionlensProviders from 'providers/providers';
import { IProviderConfig } from 'core/configuration/definitions';

export function activate(context) {
  const { languages } = require('vscode');
  const disposables = [];

  versionlensProviders.forEach(
    function (provider: AbstractVersionLensProvider<IProviderConfig>) {
      disposables.push(
        languages.registerCodeLensProvider(
          provider.config.options.selector,
          provider
        )
      );
    }
  );

  registerCommands()
    .forEach(command => {
      disposables.push(command);
    });

  context.subscriptions.push(...disposables);

  subscribeToEditorEvents();
}
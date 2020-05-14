import { registerProviders } from 'presentation/providers';
import registerCommands from 'presentation/commands/register';
import subscribeToEditorEvents from 'presentation/editor/events';

export async function activate(context) {
  const { workspace, languages } = require('vscode');

  const configuration = workspace.getConfiguration('versionlens');

  const providers = await registerProviders(configuration);

  const disposables = [];

  providers.forEach(
    function (provider) {
      disposables.push(
        languages.registerCodeLensProvider(
          provider.config.options.selector,
          provider
        )
      );
    }
  );

  registerCommands().forEach(command => {
    disposables.push(command);
  });

  context.subscriptions.push(...disposables);

  subscribeToEditorEvents();
}
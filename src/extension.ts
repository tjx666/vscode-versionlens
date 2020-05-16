import { createVersionLensLogger } from 'infrastructure/logging';
import { registerProviders } from 'presentation/providers';
import { createEditorSettings } from 'presentation/editor/editor';
import { createAppConfig } from 'presentation/configuration';

export async function activate(context) {
  const { window, workspace, languages } = require('vscode');

  const configuration = workspace.getConfiguration('versionlens');

  const appConfig = createAppConfig(configuration);

  const editorSettings = createEditorSettings(appConfig);

  const logger = createVersionLensLogger(configuration);

  const disposables = [];
  const providers = await registerProviders(configuration, logger);
  providers.forEach(
    function (provider) {
      disposables.push(
        languages.registerCodeLensProvider(
          provider.config.selector,
          provider
        )
      );
    }
  );

  context.subscriptions.push(...editorSettings.disposables);

  // check current editor if versionLens.providerActive
  editorSettings.onDidChangeActiveTextEditor(window.activeTextEditor);
}
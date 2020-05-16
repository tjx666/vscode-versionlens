import { createVersionLensLogger } from 'infrastructure/logging';
import { registerProviders } from 'presentation/providers';
import { registerEditor } from 'presentation/editor/editor';
import { createAppConfig } from 'presentation/configuration';

export async function activate(context) {
  const { window, workspace } = require('vscode');

  // composition
  const configuration = workspace.getConfiguration('versionlens');

  const appConfig = createAppConfig(configuration);

  const logger = createVersionLensLogger(configuration);

  const editor = registerEditor(appConfig, logger);

  await registerProviders(configuration, logger)
    .then(disposables => {
      disposables.push(...disposables)
    });

  context.subscriptions.push(...editor.disposables);

  // activate icons in editor if versionLens.providerActive
  editor.onDidChangeActiveTextEditor(window.activeTextEditor);
}
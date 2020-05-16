// vscode references
import * as VsCodeTypes from 'vscode';

import { createVersionLensLogger } from 'infrastructure/logging';
import { createAppConfig } from 'presentation/configuration';
import { registerProviders } from 'presentation/providers';
import { 
  registerExtension,
  registerCommands
} from 'presentation/extension';

export async function activate(context: VsCodeTypes.ExtensionContext) {
  const { window, workspace } = require('vscode');

  // composition
  const configuration = workspace.getConfiguration('versionlens');

  const appConfig = createAppConfig(configuration);

  const logger = createVersionLensLogger(configuration);

  const extension = registerExtension(appConfig, logger);

  const {
    extensionCommands,
    disposables
  } = registerCommands(extension, logger)

  await registerProviders(configuration, logger)
    .then(disposables => {
      disposables.push(...disposables)
    });

  // subscribe command and provider disposables
  context.subscriptions.push(<any>disposables);

  // show icons in active text editor if versionLens.providerActive
  extensionCommands.onDidChangeActiveTextEditor(
    window.activeTextEditor
  );
}
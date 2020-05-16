// vscode references
import * as VsCodeTypes from 'vscode';

import { createLogger } from 'infrastructure/logging';
import { createAppConfig } from 'presentation/extension';
import { registerProviders } from 'presentation/providers';
import {
  registerExtension,
  registerCommands
} from 'presentation/extension';

export async function activate(context: VsCodeTypes.ExtensionContext) {
  const { window, workspace } = require('vscode');

  // composition
  const configuration: VsCodeTypes.WorkspaceConfiguration =
    workspace.getConfiguration('versionlens');

  const appConfig = createAppConfig(configuration);

  const logger = createLogger(appConfig);

  const extension = registerExtension(appConfig, logger);

  const {
    extensionCommands,
    disposables
  } = registerCommands(extension, logger)

  await registerProviders(appConfig, logger)
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
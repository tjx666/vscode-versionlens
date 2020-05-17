// vscode references
import * as VsCodeTypes from 'vscode';

import { IRootConfig } from 'core/configuration';
import { createLogger } from 'infrastructure/logging';
import { registerProviders } from 'presentation/providers';
import {
  registerExtension,
  registerCommands,
  registerTextEditorEvents,
  registerTextDocumentEvents,
} from 'presentation/extension';

export async function activate(context: VsCodeTypes.ExtensionContext) {
  const { window, workspace } = require('vscode');

  // composition
  const configuration: IRootConfig =
    workspace.getConfiguration('versionlens');

  const extension = registerExtension(configuration);

  const logger = createLogger(extension);

  const textEditorEvents = registerTextEditorEvents(extension.state);

  registerTextDocumentEvents(extension.state);

  const disposables = registerCommands(extension, logger);

  await registerProviders(extension, logger)
    .then(disposables => {
      disposables.push(...disposables)
    });

  // subscribe command and provider disposables
  context.subscriptions.push(<any>disposables);

  // show icons in active text editor if versionLens.providerActive
  textEditorEvents.onDidChangeActiveTextEditor(
    window.activeTextEditor
  );
}
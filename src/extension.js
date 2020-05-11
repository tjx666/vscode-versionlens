/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
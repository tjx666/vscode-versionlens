/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import versionLensCommands from 'commands/register'
import codeLensProviders from 'providers/codeLensProviders'
import subscribeToEditorEvents from './editor/events'

const { Disposable, languages } = require('vscode');

export function activate(context) {
  const disposables = [];

  codeLensProviders.forEach(provider => {
    disposables.push(
      languages.registerCodeLensProvider(
        provider.selector,
        provider
      )
    );
  });

  versionLensCommands.forEach(command => {
    disposables.push(command);
  });

  context.subscriptions.push(...disposables);

  subscribeToEditorEvents();
}
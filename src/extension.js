/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { bootstrapLoaded } from './bootstrap';
import { register, resolve } from './common/di';
import { Disposable, DocumentSelector, languages, commands } from 'vscode';
import { NpmCodeLensProvider } from './providers/npm/npmCodeLensProvider';
import { BowerCodeLensProvider } from './providers/bower/bowerCodeLensProvider';
import { DubCodeLensProvider } from './providers/dub/dubCodeLensProvider';
import { DotNetCodeLensProvider } from './providers/dotnet/dotNetCodeLensProvider';
import { updateDependencyCommand, updateDependenciesCommand, linkCommand } from './commands';

export function activate(context) {
  if (bootstrapLoaded === false)
    throw ReferenceError("VersionCodelens: didnt execute it's bootstrap.");

  const config = resolve('appConfig');
  const disposables = [];
  const providers = [
    new NpmCodeLensProvider(),
    new BowerCodeLensProvider(),
    new DubCodeLensProvider(),
    new DotNetCodeLensProvider()
  ];

  providers.forEach(provider => {
    disposables.push(
      languages.registerCodeLensProvider(
        provider.selector,
        provider
      )
    );
  })

  disposables.push(
    commands.registerCommand(
      `_${config.extentionName}.updateDependencyCommand`,
      updateDependencyCommand
    ),
    commands.registerCommand(
      `_${config.extentionName}.updateDependenciesCommand`,
      updateDependenciesCommand
    ),
    commands.registerCommand(
      `_${config.extentionName}.linkCommand`,
      linkCommand
    )
  );

  context.subscriptions.push(...disposables);
}
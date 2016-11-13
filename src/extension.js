/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { bootstrapLoaded } from './bootstrap';
import { Disposable, DocumentSelector, languages, commands } from 'vscode';
import { NpmCodeLensProvider } from './providers/npm/npmCodeLensProvider';
import { BowerCodeLensProvider } from './providers/bower/bowerCodeLensProvider';
import { DubCodeLensProvider } from './providers/dub/dubCodeLensProvider';
import { DotNetCodeLensProvider } from './providers/dotnet/dotNetCodeLensProvider';
import { updateDependencyCommand, updateDependenciesCommand, doMetaCommand } from './commands';
import { AppConfiguration } from './common/appConfiguration';

export function activate(context) {
  if (bootstrapLoaded === false)
    throw ReferenceError("VersionCodelens: didnt execute it's bootstrap.");

  const config = new AppConfiguration();
  const disposables = [];
  const providers = [
    new NpmCodeLensProvider(config),
    new BowerCodeLensProvider(config),
    new DubCodeLensProvider(config),
    new DotNetCodeLensProvider(config)
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
      `_${config.extentionName}.doMetaCommand`,
      doMetaCommand
    )
  );

  context.subscriptions.push(...disposables);
}
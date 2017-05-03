/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable, DocumentSelector, languages, commands } from 'vscode';
import { NpmCodeLensProvider } from './providers/npm/npmCodeLensProvider';
import { JspmCodeLensProvider } from './providers/jspm/jspmCodeLensProvider';
import { BowerCodeLensProvider } from './providers/bower/bowerCodeLensProvider';
import { DubCodeLensProvider } from './providers/dub/dubCodeLensProvider';
import { DotNetCSProjCodeLensProvider } from './providers/dotnet/dotnetCSProjCodeLensProvider';
import { updateDependencyCommand, updateDependenciesCommand, linkCommand } from './commands';
import { appGlobals } from './common/appGlobals';

export function activate(context) {
  const disposables = [];
  const providers = [
    new NpmCodeLensProvider(),
    new JspmCodeLensProvider(),
    new BowerCodeLensProvider(),
    new DubCodeLensProvider(),
    new DotNetCSProjCodeLensProvider()
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
      `_${appGlobals.extentionName}.updateDependencyCommand`,
      updateDependencyCommand
    ),
    commands.registerCommand(
      `_${appGlobals.extentionName}.updateDependenciesCommand`,
      updateDependenciesCommand
    ),
    commands.registerCommand(
      `_${appGlobals.extentionName}.linkCommand`,
      linkCommand
    )
  );

  context.subscriptions.push(...disposables);
}
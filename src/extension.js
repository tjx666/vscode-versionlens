/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable, languages, commands, window } from 'vscode';
import { NpmCodeLensProvider } from './providers/npm/npmCodeLensProvider';
import { JspmCodeLensProvider } from './providers/jspm/jspmCodeLensProvider';
import { BowerCodeLensProvider } from './providers/bower/bowerCodeLensProvider';
import { DubCodeLensProvider } from './providers/dub/dubCodeLensProvider';
import { DotNetCSProjCodeLensProvider } from './providers/dotnet/dotnetCSProjCodeLensProvider';
import * as VersionLensCommands from './commands';
import appSettings from './common/appSettings';
import { onActiveEditorChanged } from './menus';

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
  });

  disposables.push(
    commands.registerCommand(
      `_${appSettings.extentionName}.updateDependencyCommand`,
      VersionLensCommands.updateDependencyCommand
    ),
    commands.registerCommand(
      `_${appSettings.extentionName}.updateDependenciesCommand`,
      VersionLensCommands.updateDependenciesCommand
    ),
    commands.registerCommand(
      `_${appSettings.extentionName}.linkCommand`,
      VersionLensCommands.linkCommand
    ),
    commands.registerCommand(
      `${appSettings.extentionName}.showDistTags`,
      VersionLensCommands.showDistTagsCommand
    ),
    commands.registerCommand(
      `${appSettings.extentionName}.hideDistTags`,
      VersionLensCommands.hideDistTagsCommand
    )
  );

  context.subscriptions.push(...disposables);

  // update versionLens.isActive upon start
  onActiveEditorChanged(window.activeTextEditor, providers);

  window.onDidChangeActiveTextEditor(editor => {
    // update versionLens.isActive each time the active editor changes
    onActiveEditorChanged(editor, providers);
  });

}
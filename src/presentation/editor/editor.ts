// vscode references
import * as VsCodeTypes from 'vscode';

import { AppConfig } from "presentation/configuration";
import { MenuCommandPalette } from "presentation/editor/menuCommandPalette";
import { providerRegistry } from 'presentation/providers';
import { clearDecorations } from '../editor/decorations';
import { PackageSourceTypes } from "core/packages";

export enum CommandContributions {
  ShowDependencyStatuses = 'versionlens.onShowDependencyStatuses',
  HideDependencyStatuses = 'versionlens.onHideDependencyStatuses',
  ShowTaggedVersions = 'versionlens.onShowTaggedVersions',
  HideTaggedVersions = 'versionlens.onHideTaggedVersions',
  ShowVersionLenses = 'versionlens.onShowVersionLenses',
  HideVersionLenses = 'versionlens.onHideVersionLenses',
  ShowingProgress = 'versionlens.onShowingProgress',
  UpdateDependencyCommand = 'versionlens.onUpdateDependencyCommand',
  LinkCommand = "versionlens.onLinkCommand"
}

export enum SuggestionIndicators {
  Update = '\u2191',
  Revert = '\u2193',
  OpenNewWindow = '\u29C9',
}
export class Editor {

  // icons
  palette: MenuCommandPalette;

  disposables: Array<VsCodeTypes.Disposable>

  extensionName: string;

  constructor(appConfig: AppConfig) {
    this.extensionName = "versionlens";
    this.palette = new MenuCommandPalette(appConfig);

    const { commands, window, workspace } = require('vscode');

    this.disposables = [];

    // register commands
    Object.keys(CommandContributions)
      .forEach(enumKey => {
        const command = CommandContributions[enumKey];
        const handler = this[`on${enumKey}`];
        if (!handler) throw new Error(`Could not find ${command} handler on editor class`)
        this.disposables.push(
          commands.registerCommand(
            command,
            handler.bind(this)
          )
        )
      });

    // register window and workspace events
    window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor.bind(this));
    workspace.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this))
  }

  onShowVersionLenses(file) {
    this.palette.enabled.change(true)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onHideVersionLenses(file) {
    this.palette.enabled.change(false)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onShowTaggedVersions() {
    this.palette.prereleasesEnabled.change(true)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onHideTaggedVersions(file) {
    this.palette.prereleasesEnabled.change(false)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onShowDependencyStatuses(file) {
    this.palette.showDependencyStatuses.change(true)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onHideDependencyStatuses(file) {
    this.palette.showDependencyStatuses.change(false)
      .then(_ => {
        clearDecorations();
      });
  }

  onShowingProgress(file) { }

  onUpdateDependencyCommand(codeLens, packageVersion) {
    if (codeLens.__replaced) return Promise.resolve();
    const { workspace, WorkspaceEdit } = require('vscode');
    const edit = new WorkspaceEdit();
    edit.replace(codeLens.documentUrl, codeLens.replaceRange, packageVersion);
    return workspace.applyEdit(edit)
      .then(done => codeLens.__replaced = true);
  }

  onLinkCommand(codeLens) {
    const path = require('path');
    const opener = require('opener');
    if (codeLens.package.source === PackageSourceTypes.directory) {
      const filePathToOpen = path.resolve(
        path.dirname(codeLens.documentUrl.fsPath),
        codeLens.package.resolved.version
      );
      opener(filePathToOpen);
      return;
    }
    opener(codeLens.package.meta.remoteUrl);
  }

  onDidChangeActiveTextEditor(editor: VsCodeTypes.TextEditor) {
    // update versionLens.isActive palette state
    //  each time the active editor changes
    if (!editor) {
      this.palette.providerActive.value = false;
      return;
    }

    // clearDecorations();

    if (!editor.document) {
      this.palette.providerActive.value = false;
      return;
    }

    if (providerRegistry.getByFileName(editor.document.fileName)) {
      this.palette.providerActive.value = true;
      return;
    }

    this.palette.providerActive.value = false;
  }

  onDidChangeTextDocument(changeEvent: VsCodeTypes.TextDocumentChangeEvent) {

    // ensure version lens is active
    if (this.palette.providerActive.value === false) {
      return;
    }

    // const foundDecorations = [];
    // const { contentChanges } = changeEvent;

    // // get all decorations for all the lines that have changed
    // contentChanges.forEach(change => {
    //   const startLine = change.range.start.line;
    //   let endLine = change.range.end.line;

    //   if (change.text.charAt(0) == '\n' || endLine > startLine) {
    //     removeDecorationsFromLine(startLine)
    //     return;
    //   }

    //   for (let line = startLine; line <= endLine; line++) {
    //     const lineDecorations = getDecorationsByLine(line);
    //     if (lineDecorations.length > 0)
    //       foundDecorations.push(...lineDecorations);
    //   }
    // })

    // if (foundDecorations.length === 0)
    //   return;

    // // remove all decorations that have changed
    // removeDecorations(foundDecorations);

  }

}

export function reloadActiveProviders() {
  const { window } = require('vscode');
  const fileName = window.activeTextEditor.document.fileName;
  const providers = providerRegistry.getByFileName(fileName);
  if (!providers) return false;

  providers.forEach(provider => provider.reload());
  return true;
}


let _editorSettings = null;

export default _editorSettings;

export function createEditorSettings(appConfig: AppConfig) {
  _editorSettings = new Editor(appConfig);

  return _editorSettings;
}

export function getEditorSettings(): Editor {
  return _editorSettings;
}
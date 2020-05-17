// vscode references
import * as VsCodeTypes from 'vscode';

import { ILogger } from 'core/logging';
import { PackageSourceTypes } from 'core/packages';

import { providerRegistry } from 'presentation/providers';

import { VersionLensExtension } from "./versionLensExtension";
import * as InstalledStatusHelpers from './helpers/installedStatusHelpers';
import { VersionLensState } from './versionLensState';

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

export class VersionLensCommands {

  logger: ILogger;

  state: VersionLensState;

  constructor(extensionState: VersionLensState, logger: ILogger) {
    this.logger = logger;
    this.state = extensionState;

    const { window, workspace } = require('vscode');

    // register window and workspace events
    window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor.bind(this));
    workspace.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this))
  }

  onShowVersionLenses(file) {
    this.state.enabled.change(true)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onHideVersionLenses(file) {
    this.state.enabled.change(false)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onShowTaggedVersions() {
    this.state.prereleasesEnabled.change(true)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onHideTaggedVersions(file) {
    this.state.prereleasesEnabled.change(false)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onShowDependencyStatuses(file) {
    this.state.showDependencyStatuses.change(true)
      .then(_ => {
        reloadActiveProviders();
      });
  }

  onHideDependencyStatuses(file) {
    this.state.showDependencyStatuses.change(false)
      .then(_ => {
        InstalledStatusHelpers.clearDecorations();
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
    if (codeLens.package.source === PackageSourceTypes.Directory) {
      const filePathToOpen = path.resolve(
        path.dirname(codeLens.documentUrl.fsPath),
        codeLens.package.resolved.version
      );
      opener(filePathToOpen);
      return;
    }
    opener(codeLens.package.meta.remoteUrl);
  }

  onDidChangeActiveTextEditor(textEditor: VsCodeTypes.TextEditor) {
    // maintain versionLens.providerActive state
    // each time the active editor changes
    if (!textEditor) {
      this.state.providerActive.value = false;
      return;
    }

    // clearDecorations();

    if (!textEditor.document) {
      this.state.providerActive.value = false;
      return;
    }

    if (providerRegistry.getByFileName(textEditor.document.fileName)) {
      this.state.providerActive.value = true;
      return;
    }

    this.state.providerActive.value = false;
  }

  onDidChangeTextDocument(changeEvent: VsCodeTypes.TextDocumentChangeEvent) {
    // ensure version lens is active
    if (this.state.providerActive.value === false) {
      return;
    }

    const foundDecorations = [];
    const { contentChanges } = changeEvent;

    // get all decorations for all the lines that have changed
    contentChanges.forEach(change => {
      const startLine = change.range.start.line;
      let endLine = change.range.end.line;

      if (change.text.charAt(0) == '\n' || endLine > startLine) {
        InstalledStatusHelpers.removeDecorationsFromLine(startLine)
        return;
      }

      for (let line = startLine; line <= endLine; line++) {
        const lineDecorations = InstalledStatusHelpers.getDecorationsByLine(line);
        if (lineDecorations.length > 0)
          foundDecorations.push(...lineDecorations);
      }
    })

    if (foundDecorations.length === 0) return;

    // remove all decorations that have changed
    InstalledStatusHelpers.removeDecorations(foundDecorations);
  }

}

function reloadActiveProviders() {
  const { window } = require('vscode');
  const fileName = window.activeTextEditor.document.fileName;
  const providers = providerRegistry.getByFileName(fileName);
  if (!providers) return false;

  providers.forEach(provider => provider.reload());
  return true;
}

export type RegisterCommandsResult = {
  extensionCommands: VersionLensCommands,
  disposables: Array<VsCodeTypes.Disposable>
};

export function registerCommands(extension: VersionLensExtension, logger: ILogger): RegisterCommandsResult {

  const { commands } = require('vscode');

  const disposables = [];

  const extensionCommands = new VersionLensCommands(
    extension.state,
    logger
  );

  // loop enum keys
  Object.keys(CommandContributions)
    .forEach(enumKey => {

      // register command
      const command = CommandContributions[enumKey];
      const handler = extensionCommands[`on${enumKey}`];
      if (!handler) {
        // todo roll up errors to a semantic factory
        const msg = `Could not find %s handler on %s class`;
        logger.error(msg, command, VersionLensCommands.name)
        // just return here?
        throw new Error(`Could not find ${command} handler on ${VersionLensCommands.name} class`)
      }

      // collect disposables
      disposables.push(
        commands.registerCommand(
          command,
          handler.bind(extensionCommands)
        )
      )
    });

  return {
    extensionCommands,
    disposables
  };
}
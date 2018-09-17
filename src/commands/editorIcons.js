/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from 'common/appSettings';
import { clearDecorations } from 'editor/decorations';
import * as CodeLensProviders from 'providers/codeLensProviders';

export function showTaggedVersions(file) {
  appSettings.showTaggedVersions = true;
  CodeLensProviders.reloadActiveProviders();
}

export function hideTaggedVersions(file) {
  appSettings.showTaggedVersions = false;
  CodeLensProviders.reloadActiveProviders();
}

export function showDependencyStatuses(file) {
  appSettings.showDependencyStatuses = true;
  CodeLensProviders.reloadActiveProviders();
}

export function hideDependencyStatuses(file) {
  appSettings.showDependencyStatuses = false;
  clearDecorations();
}

export function showVersionLenses(file) {
  appSettings.showVersionLenses = true;
  CodeLensProviders.reloadActiveProviders();
}

export function hideVersionLenses(file) {
  appSettings.showVersionLenses = false;
  CodeLensProviders.reloadActiveProviders();
}

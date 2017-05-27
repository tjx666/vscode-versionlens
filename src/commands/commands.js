/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from 'common/appSettings';
import * as utils from 'common/utils';
import { clearDecorations } from 'editor/decorations';

export function showTaggedVersions(file) {
  appSettings.showTaggedVersions = true;
  utils.refreshCodeLens();
}

export function hideTaggedVersions(file) {
  appSettings.showTaggedVersions = false;
  utils.refreshCodeLens();
}

export function showDependencyStatuses(file) {
  appSettings.showDependencyStatuses = true;
  utils.refreshCodeLens();
}

export function hideDependencyStatuses(file) {
  appSettings.showDependencyStatuses = false;
  clearDecorations();
}

export function showVersionLenses(file) {
  appSettings.showVersionLenses = true;
  utils.refreshCodeLens();
}

export function hideVersionLenses(file) {
  appSettings.showVersionLenses = false;
  utils.refreshCodeLens();
}

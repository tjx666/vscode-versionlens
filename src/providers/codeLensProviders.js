/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { NpmCodeLensProvider } from './npm/npmCodeLensProvider';
import { JspmCodeLensProvider } from './jspm/jspmCodeLensProvider';
import { BowerCodeLensProvider } from './bower/bowerCodeLensProvider';
import { DubCodeLensProvider } from './dub/dubCodeLensProvider';
import { DotNetCodeLensProvider } from './dotnet/dotnetCodeLensProvider';

const codeLensProviders = [
  new NpmCodeLensProvider,
  new JspmCodeLensProvider,
  new BowerCodeLensProvider,
  new DubCodeLensProvider,
  new DotNetCodeLensProvider
];

export function getProvidersByFileName(fileName) {
  const path = require('path');
  const minimatch = require('minimatch');
  const filename = path.basename(fileName);

  const filtered = codeLensProviders
    .slice(0)
    .filter(provider => minimatch(filename, provider.selector.pattern))

  if (filtered.length > 0)
    return filtered;

  return null;
}

export function reloadActiveProviders() {
  const { window } = require('vscode');
  const fileName = window.activeTextEditor.document.fileName;
  const providers = getProvidersByFileName(fileName);
  if (!providers)
    return false;

  providers.forEach(provider => provider.reload());
  return true;
}

export function reloadActiveProvidersByGroup(group) {
  const { window } = require('vscode');
  const fileName = window.activeTextEditor.document.fileName;
  let providers = getProvidersByFileName(fileName);
  if (!providers)
    return false;

  providers = providers.filter(provider => provider.selector.group.include(group));
  if (providers.length === 0)
    return false;

  providers.forEach(provider => provider.reload());
  return true;
}

export default codeLensProviders;
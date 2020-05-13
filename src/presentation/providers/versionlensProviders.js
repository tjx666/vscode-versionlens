import { NpmCodeLensProvider } from './npm/npmCodeLensProvider';
import { JspmCodeLensProvider } from './jspm/jspmCodeLensProvider';
import { DubCodeLensProvider } from './dub/dubCodeLensProvider';
import { DotNetCodeLensProvider } from './dotnet/dotnetCodeLensProvider';
import { MavenCodeLensProvider } from './maven/mavenCodeLensProvider';
import { PubCodeLensProvider } from './pub/pubCodeLensProvider';
import { ComposerCodeLensProvider } from './composer/composerCodeLensProvider';

const versionlensProviders = [
  new NpmCodeLensProvider(),
  new JspmCodeLensProvider(),
  new DubCodeLensProvider(),
  new DotNetCodeLensProvider(),
  new MavenCodeLensProvider(),
  new PubCodeLensProvider(),
  new ComposerCodeLensProvider()
];

export function getProvidersByFileName(fileName) {
  const path = require('path');
  const minimatch = require('minimatch');
  const filename = path.basename(fileName);

  const filtered = versionlensProviders
    .slice(0)
    .filter(provider => minimatch(filename, provider.selector.pattern));

  if (filtered.length > 0) return filtered;

  return null;
}

export function reloadActiveProviders() {
  const { window } = require('vscode');
  const fileName = window.activeTextEditor.document.fileName;
  const providers = getProvidersByFileName(fileName);
  if (!providers) return false;

  providers.forEach(provider => provider.reload());
  return true;
}

export function reloadActiveProvidersByGroup(group) {
  const { window } = require('vscode');
  const fileName = window.activeTextEditor.document.fileName;
  let providers = getProvidersByFileName(fileName);
  if (!providers) return false;

  providers = providers.filter(provider => provider.selector.group.include(group));
  if (providers.length === 0) return false;

  providers.forEach(provider => provider.reload());
  return true;
}

export default versionlensProviders;
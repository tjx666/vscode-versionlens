import { NpmCodeLensProvider } from '../presentation/providers/npm/npmCodeLensProvider';
import { JspmCodeLensProvider } from '../presentation/providers/jspm/jspmCodeLensProvider';
import { DubCodeLensProvider } from '../presentation/providers/dub/dubCodeLensProvider';
import { DotNetCodeLensProvider } from '../presentation/providers/dotnet/dotnetCodeLensProvider';
import { MavenCodeLensProvider } from './maven/mavenCodeLensProvider';
import { PubCodeLensProvider } from '../presentation/providers/pub/pubCodeLensProvider';
import { ComposerCodeLensProvider } from '../presentation/providers/composer/composerCodeLensProvider';

const codeLensProviders = [
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

  const filtered = codeLensProviders
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

export default codeLensProviders;
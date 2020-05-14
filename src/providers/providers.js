// todo roll them up!
import { NpmVersionLensProvider } from './npm/npmVersionLensProvider';
import { JspmVersionLensProvider } from './jspm/jspmVersionLensProvider';
import { DubVersionLensProvider } from './dub/dubVersionLensProvider';
import { DotNetVersionLensProvider } from './dotnet/dotnetVersionLensProvider';
import { MavenVersionLensProvider } from './maven/mavenVersionLensProvider';
import { PubVersionLensProvider } from './pub/pubVersionLensProvider';
import { ComposerVersionLensProvider } from './composer/composerVersionLensProvider';
import { ComposerConfig } from './composer/config';
import { DotNetConfig } from './dotnet/config';
import { DubConfig } from './dub/config';
import { NpmConfig } from './npm/config';
import { JspmConfig } from './jspm/config';
import { MavenConfig } from './maven/config';
import { PubConfig } from './pub/config';

const versionlensProviders = [
  new NpmVersionLensProvider(new NpmConfig()),
  new JspmVersionLensProvider(new JspmConfig()),
  new DubVersionLensProvider(new DubConfig()),
  new DotNetVersionLensProvider(new DotNetConfig()),
  new MavenVersionLensProvider(new MavenConfig()),
  new PubVersionLensProvider(new PubConfig()),
  new ComposerVersionLensProvider(new ComposerConfig()),
];

export function getProvidersByFileName(fileName) {
  const path = require('path');
  const filename = path.basename(fileName);

  const filtered = versionlensProviders
    .slice(0)
    .filter(provider => provider.config.matchesFilename(filename));

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
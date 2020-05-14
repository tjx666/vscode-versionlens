import appSettings from '../../appSettings';
import { clearDecorations } from '../editor/decorations';
import { providerRegistry } from 'presentation/providers';

export function showTaggedVersions(file) {
  appSettings.showTaggedVersions = true;
  reloadActiveProviders();
}

export function hideTaggedVersions(file) {
  appSettings.showTaggedVersions = false;
  reloadActiveProviders();
}

export function showDependencyStatuses(file) {
  appSettings.showDependencyStatuses = true;
  reloadActiveProviders();
}

export function hideDependencyStatuses(file) {
  appSettings.showDependencyStatuses = false;
  clearDecorations();
}

export function showVersionLenses(file) {
  appSettings.showVersionLenses = true;
  reloadActiveProviders();
}

export function hideVersionLenses(file) {
  appSettings.showVersionLenses = false;
  reloadActiveProviders();
}


export function reloadActiveProviders() {
  const { window } = require('vscode');
  const fileName = window.activeTextEditor.document.fileName;
  const providers = providerRegistry.getByFileName(fileName);
  if (!providers) return false;

  providers.forEach(provider => provider.reload());
  return true;
}
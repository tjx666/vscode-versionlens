// vscode references
import * as VsCodeTypes from 'vscode';

import {
  AbstractVersionLensProvider,
} from './abstract/abstractVersionLensProvider'

import { KeyDictionary } from 'core/definitions/generics'

import { IProviderConfig } from './definitions';

export const providerNames = [
  'composer',
  'dotnet',
  'dub',
  'jspm',
  'maven',
  'npm',
  'pub',
];

class ProviderRegistry {

  providers: KeyDictionary<AbstractVersionLensProvider<IProviderConfig>>;

  constructor() {
    this.providers = {};
  }

  register(provider: AbstractVersionLensProvider<IProviderConfig>): AbstractVersionLensProvider<IProviderConfig> {
    const key = provider.config.provider;
    if (this.providers[key]) throw new Error('Provider already registered');
    this.providers[key] = provider;
    return provider;
  }

  get(key: string) {
    return this.providers[key];
  }

  getByFileName(fileName: string) {
    const path = require('path');
    const filename = path.basename(fileName);
    const filtered = providerNames
      .map(name => this.providers[name])
      .filter(provider => provider.config.matchesFilename(filename))

    if (filtered.length === 0) return null;

    return filtered;
  }

}

export const providerRegistry = new ProviderRegistry();

export async function registerProviders(
  configuration: VsCodeTypes.WorkspaceConfiguration
): Promise<Array<AbstractVersionLensProvider<IProviderConfig>>> {

  const promisedActivation = providerNames.map(packageManager => {
    return import(`providers/${packageManager}/activate`)
      .then(module => {
        const provider = module.activate(configuration);
        return providerRegistry.register(provider);
      })
  })

  return Promise.all(promisedActivation);
}
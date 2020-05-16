// vscode references
import * as VsCodeTypes from 'vscode';

import {
  AbstractVersionLensProvider,
} from 'presentation/lenses'

import { KeyDictionary } from 'core/generic/collections'

import { IPackageProviderOptions } from "core/packages";
import { ILogger } from 'core/generic/logging';

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

  providers: KeyDictionary<AbstractVersionLensProvider<IPackageProviderOptions>>;

  constructor() {
    this.providers = {};
  }

  register(
    provider: AbstractVersionLensProvider<IPackageProviderOptions>
  ): AbstractVersionLensProvider<IPackageProviderOptions> {
    const key = provider.config.providerName;
    if (this.has(key)) throw new Error('Provider already registered');
    this.providers[key] = provider;
    return provider;
  }

  get(key: string) {
    return this.providers[key];
  }

  has(key: string) {
    return !!this.providers[key];
  }

  getByFileName(fileName: string) {
    const path = require('path');
    const filename = path.basename(fileName);
    const filtered = providerNames
      .map(name => this.providers[name])
      .filter(provider => !!provider)
      .filter(provider => matchesFilename(
        filename,
        provider.config.selector.pattern
      ))

    if (filtered.length === 0) return null;

    return filtered;
  }

}

export const providerRegistry = new ProviderRegistry();

export async function registerProviders(
  configuration: VsCodeTypes.WorkspaceConfiguration,
  logger: ILogger
): Promise<Array<AbstractVersionLensProvider<IPackageProviderOptions>>> {

  const promisedActivation = providerNames.map(packageManager => {
    return import(`providers/${packageManager}/activate`)
      .then(module => {
        const provider = module.activate(configuration, logger);
        return providerRegistry.register(provider);
      })
  })

  return Promise.all(promisedActivation);
}

function matchesFilename(filename: string, pattern: string): boolean {
  const minimatch = require('minimatch');
  return minimatch(filename, pattern);
}
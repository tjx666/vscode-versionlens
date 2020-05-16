// vscode references
import * as VsCodeTypes from 'vscode';

import { KeyDictionary } from 'core/generic/collections'
import { IPackageProviderOptions } from "core/packages";
import { ILogger } from 'core/generic/logging';

import { AppConfig } from 'presentation/configuration';
import {
  AbstractVersionLensProvider,
} from 'presentation/lenses'

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
  config: AppConfig,
  logger: ILogger
): Promise<Array<VsCodeTypes.Disposable>> {

  const {
    languages: { registerCodeLensProvider }
  } = require('vscode');

  const promisedActivation = providerNames.map(packageManager => {
    return import(`providers/${packageManager}/activate`)
      .then(module => {
        const provider = module.activate(config, logger);
        return providerRegistry.register(provider);
      })
      .then(provider => {
        return registerCodeLensProvider(
          provider.config.selector,
          provider
        );
      });
  });

  return Promise.all(promisedActivation);
}

function matchesFilename(filename: string, pattern: string): boolean {
  const minimatch = require('minimatch');
  return minimatch(filename, pattern);
}
// vscode references
import * as VsCodeTypes from 'vscode';

import { KeyDictionary } from 'core/generic/collections'
import { IPackageProviderOptions } from "core/packages";
import { ILogger } from 'core/logging';

import { VersionLensExtension } from 'presentation/extension';
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
  extension: VersionLensExtension,
  logger: ILogger
): Promise<Array<VsCodeTypes.Disposable>> {

  const {
    languages: { registerCodeLensProvider }
  } = require('vscode');

  logger.verbose('Registering providers %o', providerNames);

  const promisedActivation = providerNames.map(packageManager => {
    return import(`providers/${packageManager}/activate`)
      .then(module => {
        logger.debug('Activating package manager %s', packageManager);
        const provider = module.activate(extension, logger);

        logger.info(
          'Activated package manager %s with file filter: %O',
          provider.config.providerName,
          provider.config.selector,
        );
        return providerRegistry.register(provider);
      })
      .then(provider => {
        return registerCodeLensProvider(
          provider.config.selector,
          provider
        );
      })
      .catch(error => {
        logger.error(
          'Could not register package manager %s. Reason: %O',
          packageManager,
          error,
        );
      });
  });

  return Promise.all(promisedActivation);
}

function matchesFilename(filename: string, pattern: string): boolean {
  const minimatch = require('minimatch');
  return minimatch(filename, pattern);
}
// vscode references
import * as VsCodeTypes from 'vscode';

import { KeyDictionary } from 'core/generics'
import { ILogger, ILoggerProvider } from 'core/logging';

import { VersionLensExtension } from 'presentation/extension';
import { AbstractVersionLensProvider } from 'presentation/providers'
import { IProviderConfig } from './definitions/iProviderConfig';

class ProviderRegistry {

  providers: KeyDictionary<AbstractVersionLensProvider<IProviderConfig>>;

  providerNames: Array<string>;

  constructor() {
    this.providers = {};

    this.providerNames = [
      'composer',
      'dotnet',
      'dub',
      'jspm',
      'maven',
      'npm',
      'pub',
    ];
  }

  register(
    provider: AbstractVersionLensProvider<IProviderConfig>
  ): AbstractVersionLensProvider<IProviderConfig> {

    const key = provider.config.options.providerName;
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

  getByFileName(fileName: string): Array<AbstractVersionLensProvider<IProviderConfig>> {
    const path = require('path');
    const filename = path.basename(fileName);
    const filtered = this.providerNames
      .map(name => this.providers[name])
      .filter(provider => matchesFilename(
        filename,
        provider.config.options.selector.pattern
      ));

    if (filtered.length === 0) return null;

    return filtered;
  }

}

export const providerRegistry = new ProviderRegistry();

export async function registerProviders(
  extension: VersionLensExtension, appLogger: ILogger, loggerProvider: ILoggerProvider
): Promise<Array<VsCodeTypes.Disposable>> {

  const { languages: { registerCodeLensProvider } } = require('vscode');

  const providerNames = providerRegistry.providerNames;

  appLogger.debug('Registering providers %o', providerNames);

  const promisedActivation = providerNames.map(packageManager => {
    return import(`infrastructure/providers/${packageManager}/activate`)
      .then(module => {
        appLogger.debug('Activating package manager %s', packageManager);

        const providerLogger = loggerProvider.createLogger(packageManager);

        const provider = module.activate(extension, providerLogger);

        appLogger.debug(
          'Activated package manager %s with file filter: %O',
          provider.config.options.providerName,
          provider.config.options.selector,
        );

        return providerRegistry.register(provider);
      })
      .then(provider => {
        return registerCodeLensProvider(
          provider.config.options.selector,
          provider
        );
      })
      .catch(error => {
        appLogger.error(
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
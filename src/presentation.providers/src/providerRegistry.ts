// vscode references
import * as VsCodeTypes from 'vscode';

import { KeyDictionary } from 'core.generics'
import { ILogger } from 'core.logging';

import { VersionLensExtension } from 'presentation.extension';
import { AbstractVersionLensProvider } from 'presentation.providers'
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

    if (filtered.length === 0) return [];

    return filtered;
  }

  refreshActiveCodeLenses() {
    const { window } = require('vscode');
    const fileName = window.activeTextEditor.document.fileName;
    const providers = this.getByFileName(fileName);
    if (!providers) return false;

    providers.forEach(provider => provider.refreshCodeLenses());

    return true;
  }

}

export const providerRegistry = new ProviderRegistry();

export async function registerProviders(
  extension: VersionLensExtension, appLogger: ILogger
): Promise<Array<VsCodeTypes.Disposable>> {

  const { languages: { registerCodeLensProvider } } = require('vscode');

  const providerNames = providerRegistry.providerNames;

  appLogger.debug('Registering providers %o', providerNames.join(', '));

  const promisedActivation = providerNames.map(packageManager => {
    return import(`infrastructure.providers/${packageManager}/index`)
      .then(module => {
        appLogger.debug('Activating package manager %s', packageManager);

        const provider = module.activate(
          extension,
          appLogger.child({ namespace: packageManager })
        );

        appLogger.debug(
          'Activated package provider for %s:\n file pattern: %s\n caching: %s minutes\n strict ssl: %s\n',
          packageManager,
          provider.config.options.selector.pattern,
          provider.config.caching.duration,
          provider.config.http.strictSSL,
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
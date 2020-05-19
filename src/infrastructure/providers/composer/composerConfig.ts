import { CachingOptions, ICachingOptions } from 'core/clients';
import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from "presentation/providers";

enum ComposerContributions {
  Caching = 'composer.caching',
  DependencyProperties = 'composer.dependencyProperties',
  ApiUrl = 'composer.apiUrl',
  CacheDuration = 'composer.caching.duration',
}

export class ComposerConfig extends AbstractProviderConfig {

  options: IProviderOptions = {
    providerName: 'composer',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
      ProviderSupport.InstalledStatuses,
    ],
    selector: {
      language: 'json',
      scheme: 'file',
      pattern: '**/composer.json',
    }
  }

  caching: ICachingOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      ComposerContributions.Caching,
      'caching'
    );

  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(ComposerContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.config.get(ComposerContributions.ApiUrl);
  }

}
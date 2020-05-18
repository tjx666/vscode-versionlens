import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from "presentation/providers";
import { CachingOptions } from 'core/clients';

enum ComposerContributions {
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

  caching: CachingOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      'composer.caching', extension, 'caching'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(ComposerContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.get(ComposerContributions.ApiUrl);
  }

}
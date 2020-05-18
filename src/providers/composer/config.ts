import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderConfig,
  IProviderOptions
} from "presentation/providers";

enum ComposerContributions {
  DependencyProperties = 'composer.dependencyProperties',
  ApiUrl = 'composer.apiUrl',
  CacheDuration = 'composer.caching.duration',
}

export class ComposerConfig implements IProviderConfig {

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

  extension: VersionLensExtension

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(ComposerContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.get(ComposerContributions.ApiUrl);
  }

  get cacheDuration(): number {
    return this.extension.getOrDefault<number>(
      ComposerContributions.CacheDuration,
      this.extension.caching.duration
    );
  }

}
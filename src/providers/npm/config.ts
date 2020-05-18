import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderConfig,
  IProviderOptions
} from "presentation/providers";

enum NpmContributions {
  CacheDuration = 'npm.caching.duration',
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

export class NpmConfig implements IProviderConfig {

  options: IProviderOptions = {
    providerName: 'npm',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
      ProviderSupport.InstalledStatuses,
    ],
    selector: {
      language: 'json',
      scheme: 'file',
      pattern: '**/package.json',
    }
  };

  extension: VersionLensExtension

  defaultDependencyProperties: Array<string>;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;

    this.defaultDependencyProperties = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies'
    ];
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(NpmContributions.DependencyProperties);
  }

  get distTagFilter(): Array<string> {
    return this.extension.get(NpmContributions.DistTagFilter);
  }

  get cacheDuration(): number {
    return this.extension.getOrDefault<number>(
      NpmContributions.CacheDuration,
      this.extension.caching.duration
    );
  }

}

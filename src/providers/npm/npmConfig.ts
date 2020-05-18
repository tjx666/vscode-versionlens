import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from "presentation/providers";
import { CachingOptions } from 'core/clients';

enum NpmContributions {
  Caching = 'npm.caching',
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

export class NpmConfig extends AbstractProviderConfig {

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

  caching: CachingOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      NpmContributions.Caching,
      extension,
      'caching'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(NpmContributions.DependencyProperties);
  }

  get distTagFilter(): Array<string> {
    return this.extension.get(NpmContributions.DistTagFilter);
  }

}

import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderConfig,
  IProviderOptions
} from "presentation/lenses";

enum NpmContributions {
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

  getDependencyProperties() {
    return this.extension.getOrDefault(
      NpmContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getDistTagFilter() {
    return this.extension.getOrDefault(
      NpmContributions.DistTagFilter,
      []
    );

  }

}

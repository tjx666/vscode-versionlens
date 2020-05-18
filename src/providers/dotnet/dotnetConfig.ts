import { VersionLensExtension } from 'presentation/extension';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from "presentation/providers";
import { CachingOptions, ICachingOptions } from 'core/clients';

export enum DotnetContributions {
  Caching = 'dotnet.caching',
  DependencyProperties = 'dotnet.dependencyProperties',
  NugetFeeds = 'dotnet.nugetFeeds',
  TagFilter = 'dotnet.tagFilter',
}

export class DotNetConfig extends AbstractProviderConfig {

  options: IProviderOptions = {
    providerName: 'dotnet',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
    ],
    selector: {
      language: 'xml',
      scheme: 'file',
      pattern: '**/*.{csproj,fsproj,targets,props}',
    }
  };

  caching: ICachingOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      DotnetContributions.Caching,
      'caching'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(DotnetContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.extension.config.get(DotnetContributions.TagFilter);
  }

  get nuGetFeeds(): Array<string> {
    return this.extension.config.get(DotnetContributions.NugetFeeds);
  }

}
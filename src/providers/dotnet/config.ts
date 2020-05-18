import { VersionLensExtension } from 'presentation/extension';
import {
  IProviderOptions,
  IProviderConfig,
  ProviderSupport
} from "presentation/providers";

export enum DotnetContributions {
  CacheDuration = 'dotnet.caching.duration',
  DependencyProperties = 'dotnet.dependencyProperties',
  NugetFeeds = 'dotnet.nugetFeeds',
  TagFilter = 'dotnet.tagFilter',
}

export class DotNetConfig implements IProviderConfig {

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

  extension: VersionLensExtension;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(DotnetContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.extension.get(DotnetContributions.TagFilter);
  }

  get nuGetFeeds(): Array<string> {
    return this.extension.get(DotnetContributions.NugetFeeds);
  }

  get cacheDuration(): number {
    return this.extension.getOrDefault<number>(
      DotnetContributions.CacheDuration,
      this.extension.caching.duration
    );
  }

}
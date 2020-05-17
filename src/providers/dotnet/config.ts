import { VersionLensExtension } from 'presentation/extension';
import {
  IProviderOptions,
  IProviderConfig,
  ProviderSupport
} from "presentation/lenses";

export enum DotnetContributions {
  DependencyProperties = 'dotnet.dependencyProperties',
  NugetFeeds = 'dotnet.nugetFeeds',
  TagFilter = 'dotnet.tagFilter',

  // todo depricate this
  IncludePrerelease = 'dotnet.includePrerelease',
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

  defaultDependencyProperties: Array<string>;

  defaultNuGetFeeds: Array<string>;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;

    this.defaultNuGetFeeds = [
      'https://azuresearch-usnc.nuget.org/autocomplete'
    ];

    this.defaultDependencyProperties = [
      'PackageReference',
      'DotNetCliToolReference'
    ];
  }

  getDependencyProperties() {
    return this.extension.getOrDefault(
      DotnetContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.extension.getOrDefault(
      DotnetContributions.TagFilter,
      []
    );
  }

  getNuGetFeeds() {
    return this.extension.getOrDefault(
      DotnetContributions.NugetFeeds,
      this.defaultNuGetFeeds
    );
  }

}
import { IPackageProviderOptions, PackageFileFilter } from "core/packages";
import { AppConfig } from 'presentation/configuration';

export enum DotnetContributions {
  DependencyProperties = 'dotnet.dependencyProperties',
  NugetFeeds = 'dotnet.nugetFeeds',
  TagFilter = 'dotnet.tagFilter',

  // todo depricate this
  IncludePrerelease = 'dotnet.includePrerelease',
}

const options = {
  name: 'dotnet',
  group: ['tags'],
  selector: {
    language: 'xml',
    scheme: 'file',
    pattern: '**/*.{csproj,fsproj,targets,props}',
  }
}

export class DotNetConfig implements IPackageProviderOptions {

  config: AppConfig;

  defaultDependencyProperties: Array<string>;

  defaultNuGetFeeds: Array<string>;

  constructor(config: AppConfig) {
    this.config = config;

    this.defaultNuGetFeeds = [
      'https://azuresearch-usnc.nuget.org/autocomplete'
    ];

    this.defaultDependencyProperties = [
      'PackageReference',
      'DotNetCliToolReference'
    ];
  }

  get providerName(): string {
    return options.name;
  }

  get group(): Array<string> {
    return options.group;
  }

  get selector(): PackageFileFilter {
    return options.selector;
  }

  getDependencyProperties() {
    return this.config.getOrDefault(
      DotnetContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.config.getOrDefault(
      DotnetContributions.TagFilter,
      []
    );
  }

  getNuGetFeeds() {
    return this.config.getOrDefault(
      DotnetContributions.NugetFeeds,
      this.defaultNuGetFeeds
    );
  }

}
import { AbstractProviderConfig } from "core/configuration/abstractProviderConfig";

enum DotnetContributions {
  DependencyProperties = 'dotnet.dependencyProperties',
  NugetFeeds = 'dotnet.nugetFeeds',
  TagFilter = 'dotnet.tagFilter',

  // todo depricate this
  IncludePrerelease = 'dotnet.includePrerelease',
}

const options = {
  group: ['tags'],
  selector: {
    language: 'xml',
    scheme: 'file',
    pattern: '**/*.{csproj,fsproj,targets,props}',
  }
}

export class DotNetConfig extends AbstractProviderConfig {

  defaultDependencyProperties: Array<string>;

  defaultNuGetFeeds: Array<string>;

  constructor() {
    super('dotnet', options);

    this.defaultNuGetFeeds = [
      'https://azuresearch-usnc.nuget.org/autocomplete'
    ];

    this.defaultDependencyProperties = [
      'PackageReference',
      'DotNetCliToolReference'
    ];
  }

  getDependencyProperties() {
    return this.getContribution(
      DotnetContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.getContribution(
      DotnetContributions.TagFilter,
      []
    );
  }

  getNuGetFeeds() {
    return this.getContribution(
      DotnetContributions.NugetFeeds,
      this.defaultNuGetFeeds
    );
  }

}
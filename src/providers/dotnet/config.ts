import * as VsCodeTypes from "vscode";

import { AbstractProviderConfig } from "presentation/providers";

export enum DotnetContributions {
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

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super('dotnet', configuration, options);

    this.defaultNuGetFeeds = [
      'https://azuresearch-usnc.nuget.org/autocomplete'
    ];

    this.defaultDependencyProperties = [
      'PackageReference',
      'DotNetCliToolReference'
    ];
  }

  getDependencyProperties() {
    return this.getSetting(
      DotnetContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.getSetting(
      DotnetContributions.TagFilter,
      []
    );
  }

  getNuGetFeeds() {
    return this.getSetting(
      DotnetContributions.NugetFeeds,
      this.defaultNuGetFeeds
    );
  }

}
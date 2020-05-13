import { AbstractProviderConfig } from "core/configuration/abstractProviderConfig";

enum DotnetContributions {
  DependencyProperties = 'dotnet.dependencyProperties',
  NugetFeeds = 'dotnet.nugetFeeds',
  TagFilter = 'dotnet.tagFilter',
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

export default new class extends AbstractProviderConfig {

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
  } s

  getCSProjDependencyProperties() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(DotnetContributions.DependencyProperties, this.defaultDependencyProperties);
  }

  getTagFilter() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(DotnetContributions.TagFilter, []);
  }

  getNuGetFeeds() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(DotnetContributions.NugetFeeds, this.defaultNuGetFeeds);
  }

  getIncludePrerelease() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(DotnetContributions.IncludePrerelease, true);
  }

}
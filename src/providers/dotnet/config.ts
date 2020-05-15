import * as VsCodeTypes from "vscode";

import { AbstractProviderConfig } from "presentation/providers";
import { IProviderOptions, PackageFileFilter } from "core/packages";

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

export class DotNetConfig
  extends AbstractProviderConfig
  implements IProviderOptions {

  defaultDependencyProperties: Array<string>;

  defaultNuGetFeeds: Array<string>;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration);

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
    return this.get(
      DotnetContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.get(
      DotnetContributions.TagFilter,
      []
    );
  }

  getNuGetFeeds() {
    return this.get(
      DotnetContributions.NugetFeeds,
      this.defaultNuGetFeeds
    );
  }

}
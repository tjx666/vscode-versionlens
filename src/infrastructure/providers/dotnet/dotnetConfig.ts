import { CachingOptions, ICachingOptions } from 'core/clients';

import { VersionLensExtension } from 'presentation/extension';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from "presentation/providers";

import { NugetOptions } from './options/nugetOptions';

export enum DotnetContributions {
  Caching = 'dotnet.caching',
  Nuget = 'dotnet.nuget',
  DependencyProperties = 'dotnet.dependencyProperties',
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

  nuget: NugetOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      DotnetContributions.Caching,
      'caching'
    );

    this.nuget = new NugetOptions(
      extension.config,
      DotnetContributions.Nuget,
      null
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(DotnetContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.extension.config.get(DotnetContributions.TagFilter);
  }

}
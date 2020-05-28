import {
  CachingOptions,
  ICachingOptions,
  IHttpOptions,
  HttpOptions
} from 'core.clients';

import { VersionLensExtension } from 'presentation.extension';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from 'presentation.providers';

import { NugetOptions } from './options/nugetOptions';

export enum DotnetContributions {
  Caching = 'dotnet.caching',
  Http = 'dotnet.http',
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

  http: IHttpOptions;

  nuget: NugetOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      DotnetContributions.Caching,
      'caching'
    );

    this.http = new HttpOptions(
      extension.config,
      DotnetContributions.Http,
      'http'
    );

    this.nuget = new NugetOptions(extension.config, DotnetContributions.Nuget);
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(DotnetContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.extension.config.get(DotnetContributions.TagFilter);
  }

  get fallbackNugetSource(): string {
    return 'https://api.nuget.org/v3/index.json';
  }

}
import { ICachingOptions, IHttpOptions } from 'core.clients';

import { VersionLensExtension } from 'presentation.extension';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from 'presentation.providers';

import { INugetOptions } from "./definitions/iNugetOptions";
import { DotNetContributions } from './definitions/eDotNetContributions';

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

  nuget: INugetOptions;

  constructor(
    extension: VersionLensExtension,
    dotnetCachingOpts: ICachingOptions,
    dotnetHttpOpts: IHttpOptions,
    nugetOpts: INugetOptions,
  ) {
    super(extension);

    this.caching = dotnetCachingOpts;
    this.http = dotnetHttpOpts;
    this.nuget = nugetOpts;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(DotNetContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.extension.config.get(DotNetContributions.TagFilter);
  }

  get fallbackNugetSource(): string {
    return 'https://api.nuget.org/v3/index.json';
  }

}
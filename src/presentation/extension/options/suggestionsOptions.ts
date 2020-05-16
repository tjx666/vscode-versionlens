import { IConfig } from 'core/configuration';

enum SuggestionContributions {
  // DefaultVersionPrefix = 'versionlens.suggestions.defaultVersionPrefix',
  AlwaysShowReleases = 'suggestions.alwaysShowReleases',
  AlwaysShowPrereleases = 'suggestions.alwaysShowPrereleases',
}

export class SuggestionsOptions {

  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  get alwaysShowReleases(): boolean {
    return this.config.getOrDefault<boolean>(
      SuggestionContributions.AlwaysShowReleases,
      false
    );
  }

  get alwaysShowPrereleases(): boolean {
    return this.config.getOrDefault<boolean>(
      SuggestionContributions.AlwaysShowPrereleases,
      false
    );
  }

}
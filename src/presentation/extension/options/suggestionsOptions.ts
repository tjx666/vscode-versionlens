import { IRepository } from "core/generic/repositories";

enum SuggestionContributions {
  // DefaultVersionPrefix = 'versionlens.suggestions.defaultVersionPrefix',
  AlwaysShowReleases = 'suggestions.alwaysShowReleases',
  AlwaysShowPrereleases = 'suggestions.alwaysShowPrereleases',
}

export class SuggestionsOptions {

  private config: IRepository;

  constructor(config: IRepository) {
    this.config = config;
  }

  get alwaysShowReleases(): boolean {
    return this.config.get<boolean>(
      SuggestionContributions.AlwaysShowReleases
    );
  }

  get alwaysShowPrereleases(): boolean {
    return this.config.get<boolean>(
      SuggestionContributions.AlwaysShowPrereleases
    );
  }

}
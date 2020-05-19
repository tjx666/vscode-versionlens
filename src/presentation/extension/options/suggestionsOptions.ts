import { IRepository } from "core/generics";

enum SuggestionContributions {
  // DefaultVersionPrefix = 'versionlens.suggestions.defaultVersionPrefix',
  ShowOnStartup = 'suggestions.showOnStartup',
  ShowPrereleasesOnStartup = 'suggestions.showPrereleasesOnStartup',
}

export class SuggestionsOptions {

  private config: IRepository;

  constructor(config: IRepository) {
    this.config = config;
  }

  get showOnStartup(): boolean {
    return this.config.get<boolean>(
      SuggestionContributions.ShowOnStartup
    );
  }

  get showPrereleasesOnStartup(): boolean {
    return this.config.get<boolean>(
      SuggestionContributions.ShowPrereleasesOnStartup
    );
  }

}
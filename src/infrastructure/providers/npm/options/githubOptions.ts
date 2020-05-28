import { IFrozenRepository, Nullable } from 'core/generics';
import { OptionsWithFallback } from 'core/configuration';

enum GitHubContributions {
  AccessToken = 'accessToken',
}

export class GitHubOptions extends OptionsWithFallback {

  constructor(
    config: IFrozenRepository,
    section: string,
    fallbackSection: Nullable<string> = null
  ) {
    super(config, section, fallbackSection);
  }

  get accessToken(): string {
    return this.getOrDefault<string>(
      GitHubContributions.AccessToken,
      null
    );
  }

}
import { IFrozenRepository } from 'core/generics';
import { Options } from 'core/configuration';

enum GitHubContributions {
  AccessToken = 'accessToken',
}

export class GitHubOptions extends Options {

  constructor(config: IFrozenRepository, section: string) {
    super(config, section);
  }

  get accessToken(): string {
    return this.get<string>(GitHubContributions.AccessToken);
  }

}
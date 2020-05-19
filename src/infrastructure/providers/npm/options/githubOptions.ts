import { IFrozenRespository } from 'core/generics';
import { AbstractOptions } from 'core/configuration';

enum GitHubContributions {
  AccessToken = 'accessToken',
}

export class GitHubOptions extends AbstractOptions {

  constructor(config: IFrozenRespository, section: string, defaultSection?: string) {
    super(config, section, defaultSection);
  }

  get accessToken(): string {
    return this.getOrDefault<string>(
      GitHubContributions.AccessToken,
      null
    );
  }

}
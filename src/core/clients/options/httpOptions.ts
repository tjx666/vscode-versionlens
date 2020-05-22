import { OptionsWithFallback } from 'core/configuration';
import { IFrozenRepository, Nullable } from 'core/generics';
import { IHttpOptions, HttpContributions } from 'core/clients';

export class HttpOptions extends OptionsWithFallback implements IHttpOptions {

  constructor(
    config: IFrozenRepository,
    section: string,
    fallbackSection: Nullable<string> = null
  ) {
    super(config, section, fallbackSection);
  }

  get strictSSL(): boolean {
    return this.getOrDefault<boolean>(
      HttpContributions.StrictSSL,
      true
    );
  }

}
import { IFrozenRepository } from 'core/generics';
import { Options } from 'core/configuration';

enum NugetContributions {
  Sources = 'sources',
}

export class NugetOptions extends Options {

  constructor(config: IFrozenRepository, section: string) {
    super(config, section);
  }

  get sources(): Array<string> {
    return this.get<Array<string>>(NugetContributions.Sources);
  }

}
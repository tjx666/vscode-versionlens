import { IFrozenRespository } from 'core/generics';
import { AbstractOptions } from 'core/configuration';

enum NugetContributions {
  Sources = 'sources',
}

export class NugetOptions extends AbstractOptions {

  constructor(config: IFrozenRespository, section: string, defaultSection?: string) {
    super(config, section, defaultSection);
  }

  get sources(): Array<string> {
    return this.get<Array<string>>(NugetContributions.Sources);
  }

}
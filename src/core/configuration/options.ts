import { IFrozenRepository } from "core/generics";
import { IOptions } from "core/configuration";

export abstract class Options implements IOptions {

  protected section: string;

  config: IFrozenRepository;

  constructor(config: IFrozenRepository, section: string) {
    this.config = config;
    this.section = (section.length > 0) ? section + '.' : '';
  }

  get<T>(key: string): T {
    return this.config.get(`${this.section}${key}`);
  }

  defrost(): void {
    this.config.defrost();
  }

}
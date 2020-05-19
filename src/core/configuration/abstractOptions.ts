import { IFrozenRespository } from "core/generic/repositories";
import { IOptions } from "core/configuration";

export abstract class AbstractOptions implements IOptions {

  protected section: string;

  protected defaultSection: string;

  config: IFrozenRespository;

  constructor(config: IFrozenRespository, section: string, defaultSection?: string) {
    this.config = config;
    this.section = (section.length > 0) ? section + '.' : '';
    this.defaultSection = defaultSection;
  }

  get<T>(key: string): T {
    return this.config.get(`${this.section}${key}`);
  }

  getOrDefault<T>(key: string, defaultValue: T): T {
    // attempt to get the section value
    const sectionValue: T = this.config.get(`${this.section}${key}`);

    // return key value
    if (sectionValue !== null && sectionValue !== undefined) return sectionValue;

    // attempt to get default section value
    let defaultSectionValue: T;
    if (this.defaultSection !== null) {
      defaultSectionValue = this.config.get(`${this.defaultSection}.${key}`);
    }

    // return default key value
    if (defaultSectionValue !== null && defaultSectionValue !== undefined) return defaultSectionValue;

    // return arg default value
    return defaultValue;
  }

  defrost() {
    this.config.defrost();
  }

}
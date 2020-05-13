import { IProviderConfig, ProviderOptions } from "./definitions";

export class AbstractProviderConfig implements IProviderConfig {

  provider: string;

  options: ProviderOptions;

  constructor(provider: string, options: ProviderOptions) {
    this.provider = provider;
    this.options = options;
  }

  matchesFilename(filename: string): boolean {
    const minimatch = require('minimatch');
    return minimatch(filename, this.options.pattern);
  }

}
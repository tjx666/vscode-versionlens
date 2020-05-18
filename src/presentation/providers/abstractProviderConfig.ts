import { VersionLensExtension } from 'presentation/extension';
import { IProviderOptions } from './definitions/iProviderOptions';

export abstract class AbstractProviderConfig {

  abstract options: IProviderOptions;

  extension: VersionLensExtension

  constructor(extension: VersionLensExtension) {
    this.extension = extension;
  }

}
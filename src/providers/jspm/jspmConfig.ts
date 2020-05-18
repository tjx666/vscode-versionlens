import { VersionLensExtension } from 'presentation/extension';
import { NpmConfig } from 'providers/npm/npmConfig';

export class JspmConfig extends NpmConfig {

  constructor(extension: VersionLensExtension) {
    super(extension);
    this.options.providerName = 'jspm';
  }

}
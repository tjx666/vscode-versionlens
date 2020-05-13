import { NpmConfig } from '../npm/config';

enum NpmContributions {
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

class JspmConfig extends NpmConfig {

  constructor() {
    super();
    this.provider = 'jspm';
  }

}

export default new JspmConfig();
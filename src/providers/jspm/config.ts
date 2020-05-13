import { NpmConfig } from '../npm/config';

enum NpmContributions {
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

class JspmConfig extends NpmConfig {

  constructor() {
    super('jspm');
  }

}

export default new JspmConfig();
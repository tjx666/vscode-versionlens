import { NpmConfig } from '../npm/config';

// enum JspmContributions {
//   DependencyProperties = 'npm.dependencyProperties',
//   DistTagFilter = 'npm.distTagFilter',
// }

export class JspmConfig extends NpmConfig {

  constructor() {
    super('jspm');
  }

}
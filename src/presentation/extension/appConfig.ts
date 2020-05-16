import { WorkspaceConfig as AbstractWorkspaceConfig } from '../../core/configuration/abstractWorkspaceConfig'
import { IConfig } from "core/configuration";

enum AppContributions {
  ShowVersionLensesAtStartup = 'showVersionLensesAtStartup',
  ShowTaggedVersionsAtStartup = 'showTaggedVersionsAtStartup',
  ShowDependencyStatusesAtStartup = 'showDependencyStatusesAtStartup',
  VersionPrefix = 'versionPrefix',
  MissingDependencyColour = 'missingDependencyColour',
  InstalledDependencyColour = 'installedDependencyColour',
  OutdatedDependencyColour = 'outdatedDependencyColour',
  PrereleaseDependencyColour = 'prereleaseDependencyColour',
  GithubTaggedCommits = 'github.taggedCommits',
}

export class AppConfig extends AbstractWorkspaceConfig {

  constructor(config: IConfig) {
    super(config);
  }

  get showVersionLensesAtStartup() {
    return this.getOrDefault(
      AppContributions.ShowVersionLensesAtStartup,
      true
    );
  }

  get showTaggedVersionsAtStartup() {
    return this.getOrDefault(
      AppContributions.ShowTaggedVersionsAtStartup,
      false
    );
  }

  get showDependencyStatusesAtStartup() {
    return this.getOrDefault(
      AppContributions.ShowDependencyStatusesAtStartup,
      false
    );
  }

  get versionPrefix() {
    return this.getOrDefault(
      AppContributions.VersionPrefix,
      ''
    );
  }

  get githubTaggedCommits() {
    return this.getOrDefault(
      AppContributions.GithubTaggedCommits,
      ['Release', 'Tag']
    );
  }

  get missingDependencyColour() {
    return this.getOrDefault(
      AppContributions.MissingDependencyColour,
      'red'
    );
  }

  get installedDependencyColour() {
    return this.getOrDefault(
      AppContributions.InstalledDependencyColour,
      'green'
    );
  }

  get outdatedDependencyColour() {
    return this.getOrDefault(
      AppContributions.InstalledDependencyColour,
      'orange'
    );
  }

  get prereleaseDependencyColour() {
    return this.getOrDefault(
      AppContributions.PrereleaseDependencyColour,
      'yellowgreen'
    );
  }

}


// todo remove decorators dep and use new keyword in root
let _appConfigSingleton = null;

export default _appConfigSingleton;

export function createAppConfig(configRoot: IConfig) {
  _appConfigSingleton = new AppConfig(configRoot);

  return _appConfigSingleton;
}
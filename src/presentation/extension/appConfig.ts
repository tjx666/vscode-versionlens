import { AbstractWorkspaceConfig, IRootConfig } from 'core/configuration'
import { IConfig } from "core/configuration";
import { LoggingOptions } from "./options/loggingOptions";
import { SuggestionsOptions } from "./options/suggestionsOptions";

enum AppContributions {
  // vscode ui (todo move to options class)
  ShowDependencyStatusesAtStartup = 'showDependencyStatusesAtStartup',
  MissingDependencyColour = 'missingDependencyColour',
  InstalledDependencyColour = 'installedDependencyColour',
  OutdatedDependencyColour = 'outdatedDependencyColour',
  PrereleaseDependencyColour = 'prereleaseDependencyColour',

  GithubTaggedCommits = 'github.taggedCommits',
}

export class AppConfig extends AbstractWorkspaceConfig {

  logging: LoggingOptions;
  suggestions: SuggestionsOptions;

  constructor(config: IConfig) {
    super(config);

    this.logging = new LoggingOptions(this);
    this.suggestions = new SuggestionsOptions(this);
  }


  get showDependencyStatusesAtStartup() {
    return this.getOrDefault(
      AppContributions.ShowDependencyStatusesAtStartup,
      false
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

export function createAppConfig(configRoot: IRootConfig) {
  _appConfigSingleton = new AppConfig(<IConfig>configRoot);

  return _appConfigSingleton;
}
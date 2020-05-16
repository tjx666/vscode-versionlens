import * as VsCodeTypes from "vscode";

import { AbstractWorkspaceConfig } from './abstractWorkspaceConfig'

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

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration);
  }

  get showVersionLensesAtStartup() {
    return super.get(
      AppContributions.ShowVersionLensesAtStartup,
      true
    );
  }

  get showTaggedVersionsAtStartup() {
    return super.get(
      AppContributions.ShowTaggedVersionsAtStartup,
      false
    );
  }

  get showDependencyStatusesAtStartup() {
    return super.get(
      AppContributions.ShowDependencyStatusesAtStartup,
      false
    );
  }

  get versionPrefix() {
    return super.get(
      AppContributions.VersionPrefix,
      ''
    );
  }

  get githubTaggedCommits() {
    return super.get(
      AppContributions.GithubTaggedCommits,
      ['Release', 'Tag']
    );
  }

  get missingDependencyColour() {
    return super.get(
      AppContributions.MissingDependencyColour,
      'red'
    );
  }

  get installedDependencyColour() {
    return super.get(
      AppContributions.InstalledDependencyColour,
      'green'
    );
  }

  get outdatedDependencyColour() {
    return super.get(
      AppContributions.InstalledDependencyColour,
      'orange'
    );
  }

  get prereleaseDependencyColour() {
    return super.get(
      AppContributions.PrereleaseDependencyColour,
      'yellowgreen'
    );
  }

}

let appConfig = null;

export default appConfig;

export function createAppConfig(configuration: VsCodeTypes.WorkspaceConfiguration) {
  appConfig = new AppConfig(configuration);

  return appConfig;
}
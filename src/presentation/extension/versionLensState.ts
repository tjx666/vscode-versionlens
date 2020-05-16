import { ContextState } from "./models/contextState";
import { VersionLensExtension } from "./versionLensExtension";

enum StateContributions {
  Enabled = 'versionlens.enabled',
  PrereleasesEnabled = 'versionlens.prereleasesEnabled',
  ProviderActive = 'versionlens.providerActive',
  ProviderBusy = 'versionlens.providerBusy',
  ShowDependencyStatuses = 'versionlens.showDependencyStatuses',
}

export class VersionLensState {

  // states
  enabled: ContextState<boolean>;
  prereleasesEnabled: ContextState<boolean>;
  providerActive: ContextState<boolean>;
  providerBusy: ContextState<boolean>;
  showDependencyStatuses: ContextState<boolean>;

  constructor(extension: VersionLensExtension) {

    this.providerActive = new ContextState(
      StateContributions.ProviderActive,
      false
    );

    this.providerBusy = new ContextState(
      StateContributions.ProviderBusy,
      false
    );

    this.enabled = new ContextState(
      StateContributions.Enabled,
      extension.suggestions.alwaysShowReleases
    );

    this.prereleasesEnabled = new ContextState(
      StateContributions.PrereleasesEnabled,
      extension.suggestions.alwaysShowPrereleases
    );

    this.showDependencyStatuses = new ContextState(
      StateContributions.ShowDependencyStatuses,
      false
    );



  }

}
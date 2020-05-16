import { ContextState } from "./models/contextState";
import { AppConfig } from "presentation/extension";

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

  constructor(appConfig: AppConfig) {

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
      false
    );

    this.showDependencyStatuses = new ContextState(
      StateContributions.ShowDependencyStatuses,
      appConfig.showDependencyStatusesAtStartup === true
    );

    this.prereleasesEnabled = new ContextState(
      StateContributions.PrereleasesEnabled,
      appConfig.showTaggedVersionsAtStartup === true
    );

  }

}
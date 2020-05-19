import { ContextState } from "./models/contextState";
import { VersionLensExtension } from "./versionLensExtension";

enum StateContributions {
  Enabled = 'versionlens.enabled',
  PrereleasesEnabled = 'versionlens.prereleasesEnabled',
  ProviderActive = 'versionlens.providerActive',
  ProviderBusy = 'versionlens.providerBusy',
  ProviderSupportsPrereleases = 'versionlens.providerSupportsPrereleases',
  ProviderSupportsInstalledStatuses = 'versionlens.providerSupportsInstalledStatuses',
  ShowInstalledStatuses = 'versionlens.showInstalledStatuses',
}

export class VersionLensState {

  // states
  enabled: ContextState<boolean>;
  prereleasesEnabled: ContextState<boolean>;
  providerActive: ContextState<boolean>;
  providerBusy: ContextState<boolean>;
  providerSupportsPrereleases: ContextState<boolean>;
  providerSupportsInstalledStatuses: ContextState<boolean>;

  showInstalledStatuses: ContextState<boolean>;

  constructor(extension: VersionLensExtension) {

    this.enabled = new ContextState(
      StateContributions.Enabled,
      extension.suggestions.showOnStartup
    );

    this.providerActive = new ContextState(
      StateContributions.ProviderActive,
      false
    );

    this.providerBusy = new ContextState(
      StateContributions.ProviderBusy,
      false
    );

    this.providerSupportsPrereleases = new ContextState(
      StateContributions.ProviderSupportsPrereleases,
      false
    );

    this.providerSupportsInstalledStatuses = new ContextState(
      StateContributions.ProviderSupportsInstalledStatuses,
      false
    );

    this.prereleasesEnabled = new ContextState(
      StateContributions.PrereleasesEnabled,
      extension.suggestions.showPrereleasesOnStartup
    );

    this.showInstalledStatuses = new ContextState(
      StateContributions.ShowInstalledStatuses,
      false
    );

  }

}
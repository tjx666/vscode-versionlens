import { VsCodePaletteState } from "./vsCodeContextState";
import { AppConfig } from "presentation/configuration";

enum StateContributions {
  Enabled = 'versionlens.enabled',
  PrereleasesEnabled = 'versionlens.prereleasesEnabled',
  ProviderActive = 'versionlens.providerActive',
  ProviderBusy = 'versionlens.providerBusy',
  ShowDependencyStatuses = 'versionlens.showDependencyStatuses',
}

export class VersionLensState {

  // states
  enabled: VsCodePaletteState<boolean>;
  prereleasesEnabled: VsCodePaletteState<boolean>;
  providerActive: VsCodePaletteState<boolean>;
  providerBusy: VsCodePaletteState<boolean>;
  showDependencyStatuses: VsCodePaletteState<boolean>;

  constructor(appConfig: AppConfig) {

    this.providerActive = new VsCodePaletteState(
      StateContributions.ProviderActive,
      false
    );

    this.providerBusy = new VsCodePaletteState(
      StateContributions.ProviderBusy,
      false
    );

    this.enabled = new VsCodePaletteState(
      StateContributions.Enabled,
      false
    );

    this.showDependencyStatuses = new VsCodePaletteState(
      StateContributions.ShowDependencyStatuses,
      appConfig.showDependencyStatusesAtStartup === true
    );

    this.prereleasesEnabled = new VsCodePaletteState(
      StateContributions.PrereleasesEnabled,
      appConfig.showTaggedVersionsAtStartup === true
    );

  }

}
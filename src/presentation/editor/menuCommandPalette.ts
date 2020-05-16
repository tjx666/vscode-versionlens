import { VsCodePaletteState } from "../commands/model/vsCodePaletteState";
import { AppConfig } from "presentation/configuration";

enum IconStateContributions {
  Enabled = 'versionlens.enabled',
  PrereleasesEnabled = 'versionlens.prereleasesEnabled',
  ProviderActive = 'versionlens.providerActive',
  ProviderBusy = 'versionlens.providerBusy',
  ShowDependencyStatuses = 'versionlens.showDependencyStatuses',
}

export class MenuCommandPalette {

  // states
  enabled: VsCodePaletteState<boolean>;
  prereleasesEnabled: VsCodePaletteState<boolean>;
  providerActive: VsCodePaletteState<boolean>;
  providerBusy: VsCodePaletteState<boolean>;
  showDependencyStatuses: VsCodePaletteState<boolean>;

  constructor(appConfig: AppConfig) {

    // palette states
    this.providerActive = new VsCodePaletteState(
      IconStateContributions.ProviderActive,
      false
    );

    this.providerBusy = new VsCodePaletteState(
      IconStateContributions.ProviderBusy,
      false
    );

    this.enabled = new VsCodePaletteState(
      IconStateContributions.Enabled,
      false
    );

    this.showDependencyStatuses = new VsCodePaletteState(
      IconStateContributions.ShowDependencyStatuses,
      appConfig.showDependencyStatusesAtStartup === true
    );

    this.prereleasesEnabled = new VsCodePaletteState(
      IconStateContributions.PrereleasesEnabled,
      appConfig.showTaggedVersionsAtStartup === true
    );

  }

}
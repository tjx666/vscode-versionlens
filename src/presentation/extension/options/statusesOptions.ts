import { IConfig } from 'core/configuration';

enum StatusesContributions {
  AlwaysShowInstalledStatus = 'statuses.alwaysShowInstalledStatuses',
  NotInstalledColour = 'statuses.notInstalledColour',
  InstalledColour = 'statuses.installedColour',
  OutdatedColour = 'statuses.outdatedColour',
  prereleaseInstalledColour = 'statuses.prereleaseInstalledColour',
}

export class StatusesOptions {

  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  get installedColour() {
    return this.config.getOrDefault(
      StatusesContributions.InstalledColour,
      'green'
    );
  }

  get notInstalledColour() {
    return this.config.getOrDefault(
      StatusesContributions.NotInstalledColour,
      'red'
    );
  }

  get outdatedColour() {
    return this.config.getOrDefault(
      StatusesContributions.OutdatedColour,
      'orange'
    );
  }

  get prereleaseInstalledColour() {
    return this.config.getOrDefault(
      StatusesContributions.prereleaseInstalledColour,
      'yellowgreen'
    );
  }

}
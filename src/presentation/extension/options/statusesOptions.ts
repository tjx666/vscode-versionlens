import { IRepository } from "core/generic/repositories";

enum StatusesContributions {
  AlwaysShowInstalledStatus = 'statuses.alwaysShowInstalledStatuses',
  NotInstalledColour = 'statuses.notInstalledColour',
  InstalledColour = 'statuses.installedColour',
  OutdatedColour = 'statuses.outdatedColour',
  prereleaseInstalledColour = 'statuses.prereleaseInstalledColour',
}

export class StatusesOptions {

  private config: IRepository;

  constructor(config: IRepository) {
    this.config = config;
  }

  get installedColour() {
    return this.config.get<string>(StatusesContributions.InstalledColour);
  }

  get notInstalledColour() {
    return this.config.get<string>(StatusesContributions.NotInstalledColour);
  }

  get outdatedColour() {
    return this.config.get<string>(StatusesContributions.OutdatedColour);
  }

  get prereleaseInstalledColour() {
    return this.config.get<string>(StatusesContributions.prereleaseInstalledColour);
  }

}
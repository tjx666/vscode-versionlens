// vscode references
import * as VsCodeTypes from 'vscode';

import { ILogger } from 'core.logging';
import {
  extractPackageDependenciesFromJson,
  IPackageClient,
  RequestFactory
} from 'core.packages';

// imports
import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse
} from 'presentation.providers';

import { NpmConfig } from './npmConfig';
import { npmReplaceVersion } from './npmUtils';
import { NpmPackageClient } from './clients/npmPackageClient';

export class NpmVersionLensProvider
  extends AbstractVersionLensProvider<NpmConfig> {

  packageClient: IPackageClient<null>;

  constructor(config: NpmConfig, logger: ILogger) {
    super(config, logger);

    this.packageClient = new NpmPackageClient(config, logger);

    this.customReplaceFn = npmReplaceVersion;
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDependencies = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.dependencyProperties
    );
    if (packageDependencies.length === 0) return null;

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    const context = {
      includePrereleases,
      clientData: null,
    }

    if (this.config.github.accessToken &&
      this.config.github.accessToken.length > 0) {
      // defrost github parameters
      this.config.github.defrost();
    }

    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.packageClient,
      packageDependencies,
      context,
    );
  }

  async updateOutdated(packagePath: string): Promise<any> {

  }


} // End NpmCodeLensProvider
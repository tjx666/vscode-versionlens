import { ILogger } from 'core.logging';
import { ISuggestionProvider } from 'core.suggestions';
import {
  extractPackageDependenciesFromJson,
  RequestFactory,
  IPackageDependency,
  PackageResponse,
  ReplaceVersionFunction
} from 'core.packages';

import { NpmPackageClient } from './clients/npmPackageClient';
import { npmReplaceVersion } from './npmUtils';
import { NpmConfig } from './npmConfig';

export class NpmSuggestionProvider implements ISuggestionProvider {

  config: NpmConfig;

  client: NpmPackageClient;

  logger: ILogger;

  suggestionReplaceFn: ReplaceVersionFunction;

  constructor(client: NpmPackageClient, logger: ILogger) {
    this.client = client;
    this.config = client.config;
    this.logger = logger;
    this.suggestionReplaceFn = npmReplaceVersion;
  }

  parseDependencies(packageText: string): Array<IPackageDependency> {
    const packageDependencies = extractPackageDependenciesFromJson(
      packageText,
      this.config.dependencyProperties
    );

    return packageDependencies;
  }

  async fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<IPackageDependency>
  ): Promise<Array<PackageResponse>> {

    if (this.config.github.accessToken &&
      this.config.github.accessToken.length > 0) {
      // defrost github parameters
      this.config.github.defrost();
    }

    const clientData = null;
    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.client,
      clientData,
      packageDependencies,
    );
  }

}
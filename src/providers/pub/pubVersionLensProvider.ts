// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { extractPackageDependenciesFromYaml } from "core/packages";
import { AbstractVersionLensProvider, VersionLensFetchResponse } from "presentation/providers/abstract/abstractVersionLensProvider";
import { VersionLensFactory } from 'presentation/lenses';

import PubConfig from 'providers/pub/config';
import { fetchPubPackage } from 'providers/pub/pubApiClient';

export class PubCodeLensProvider extends AbstractVersionLensProvider {

  constructor() {
    super(PubConfig);
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractPackageDependenciesFromYaml(
      document.getText(),
      PubConfig.getDependencyProperties()
    );
    if (packageDepsLenses.length === 0) return null;

    const context = {
      packageFetchRequest: fetchPubPackage,
      logger: this.logger,
    }

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      context,
    );
  }

  async updateOutdated(packagePath: string): Promise<any> {
    return Promise.resolve();
  }

}
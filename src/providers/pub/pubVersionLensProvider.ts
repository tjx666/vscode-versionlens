// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import PubConfig from 'providers/pub/config';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from "presentation/providers/abstract/abstractVersionLensProvider";
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { extractPackageDependenciesFromYaml } from "core/packages";
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

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      this.logger,
      fetchPubPackage,
      null
    );
  }

  updateOutdated(packagePath: string): Promise<any> { 
    return Promise.resolve(); 
  }

}
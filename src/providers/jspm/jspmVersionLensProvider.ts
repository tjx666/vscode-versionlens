// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { VersionLensFactory } from 'presentation/lenses';
import { VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import { NpmVersionLensProvider } from 'providers/npm/npmVersionLensProvider';
import { customJspmFormatVersion } from './jspmVersionUtils';
import { extractPackageDependenciesFromJson } from './jspmPackageParser';

export class JspmVersionLensProvider extends NpmVersionLensProvider {

  constructor(jspmConfig) {
    super(jspmConfig);
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    // extract dependencies from json
    const jspmDependencyLenses = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.getDependencyProperties(),
    );
    if (jspmDependencyLenses.length === 0) return null;

    const context = {
      client: this.pacoteClient,
      clientData: this.config,
      logger: this.logger,
      replaceFn: customJspmFormatVersion,
    }

    // fetch from npm
    return VersionLensFactory.createVersionLenses(
      document,
      jspmDependencyLenses,
      context,
    );
  }

}
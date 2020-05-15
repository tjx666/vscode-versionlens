// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { VersionLensFactory } from 'presentation/lenses';
import { VersionLensFetchResponse } from 'presentation/providers';
import { NpmVersionLensProvider } from 'providers/npm/npmVersionLensProvider';
import { extractPackageDependenciesFromJson } from './jspmPackageParser';
import { npmReplaceVersion } from 'providers/npm/npmVersionUtils';

export class JspmVersionLensProvider extends NpmVersionLensProvider {

  constructor(jspmConfig) {
    super(jspmConfig);
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const jspmDependencyLenses = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.getDependencyProperties(),
    );
    if (jspmDependencyLenses.length === 0) return null;

    const context = {
      client: this.pacoteClient,
      clientData: this.config,
      logger: this.logger,
      replaceVersion: npmReplaceVersion,
    }

    // fetch from npm
    return VersionLensFactory.createVersionLenses(
      document,
      jspmDependencyLenses,
      context,
    );
  }

}
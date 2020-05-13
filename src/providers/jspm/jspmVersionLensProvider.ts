// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import { NpmCodeLensProvider } from 'providers/npm/npmVersionLensProvider';
import { fetchNpmPackage } from 'providers/npm/pacoteApiClient';
import JspmConfig from './config';
import { customJspmFormatVersion } from './jspmVersionUtils';

import { extractPackageDependenciesFromJson } from './jspmPackageParser';

export class JspmCodeLensProvider extends NpmCodeLensProvider {

  constructor() {
    super(JspmConfig);
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    // extract dependencies from json
    const jspmDependencyLenses = extractPackageDependenciesFromJson(
      document.getText(),
      JspmConfig.getDependencyProperties(),
    );
    if (jspmDependencyLenses.length === 0) return null;

    // fetch from npm
    return VersionLensFactory.createVersionLenses(
      document,
      jspmDependencyLenses,
      this.logger,
      fetchNpmPackage,
      customJspmFormatVersion
    );
  }

}
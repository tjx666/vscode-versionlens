// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import NpmConfig from 'core/providers/npm/config';
import { extractPackageDependenciesFromJson } from '../../../core/providers/jspm/jspmPackageParser';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { VersionLensFetchResponse } from 'presentation/lenses/abstract/abstractVersionLensProvider';
import { NpmCodeLensProvider } from '../npm/npmCodeLensProvider';
import { resolveJspmPackage } from './jspmPackageResolver';

export class JspmCodeLensProvider extends NpmCodeLensProvider {

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    const packageDepsLenses = extractPackageDependenciesFromJson(document.getText(), NpmConfig.getDependencyProperties());
    if (packageDepsLenses.length === 0) return Promise.resolve([]);

    return VersionLensFactory.createVersionLenses(
      packagePath,
      document,
      packageDepsLenses,
      resolveJspmPackage
    );
  }

}
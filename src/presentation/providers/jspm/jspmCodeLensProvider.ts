// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import JspmConfig from 'core/providers/jspm/config';
import { extractPackageDependenciesFromJson } from '../../../core/providers/jspm/jspmPackageParser';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import { NpmCodeLensProvider } from '../npm/npmCodeLensProvider';
import { resolveJspmPackage, customJspmReplaceVersion } from './jspmPackageResolver';

export class JspmCodeLensProvider extends NpmCodeLensProvider {

  constructor() {
    super(JspmConfig.provider);
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    const packageDepsLenses = extractPackageDependenciesFromJson(
      document.getText(),
      JspmConfig.getDependencyProperties(),
    );
    if (packageDepsLenses.length === 0) return null;

    // return VersionLensFactory.createVersionLenses(
    //   document,
    //   packageDepsLenses,
    //   this.logger,
    //   resolveJspmPackage,
    //   customJspmReplaceVersion
    // );
  }

}
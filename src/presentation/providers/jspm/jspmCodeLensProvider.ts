// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import appContrib from '../../../appContrib';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { NpmCodeLensProvider } from '../npm/npmCodeLensProvider';
import { extractJspmLensDataFromText } from './jspmPackageParser';
import { resolveJspmPackage } from './jspmPackageResolver';
import { VersionLensFetchResponse } from 'presentation/lenses/abstract/abstractVersionLensProvider';

export class JspmCodeLensProvider extends NpmCodeLensProvider {

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    const packageDepsLenses = extractJspmLensDataFromText(document.getText(), appContrib.npmDependencyProperties);
    if (packageDepsLenses.length === 0) return Promise.resolve([]);

    return VersionLensFactory.createVersionLenses(
      packagePath,
      document,
      packageDepsLenses,
      resolveJspmPackage
    );
  }

}
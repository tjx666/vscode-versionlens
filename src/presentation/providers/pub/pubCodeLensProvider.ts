// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import appContrib from 'appContrib';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from "presentation/lenses/abstract/abstractVersionLensProvider";
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { extractPackageLensDataFromText } from "core/providers/pub/pubPackageParser";
import { resolvePubPackage } from "./pubPackageResolver";

export class PubCodeLensProvider extends AbstractVersionLensProvider {

  get selector() {
    return {
      language: "yaml",
      scheme: "file",
      pattern: "**/pubspec.yaml"
    };
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    const packageDepsLenses = extractPackageLensDataFromText(document.getText(), appContrib.pubDependencyProperties);
    if (packageDepsLenses.length === 0) return Promise.resolve([]);

    return VersionLensFactory.createVersionLenses(
      packagePath,
      document,
      packageDepsLenses,
      resolvePubPackage
    );
  }

  updateOutdated() { }

  /*
evaluateCodeLens(codeLens: IVersionCodeLens) {

  if (
    codeLens.command &&
    codeLens.command.command.includes("updateDependenciesCommand")
  ) {
    return codeLens;
  }

  if (codeLens.package.version === "latest") {
    return CommandFactory.createMatchesLatestVersionCommand(codeLens);
  }

  return pubGetPackageInfo(codeLens.package.name)
    .then((info: any) => {
      return CommandFactory.createVersionCommand(
        codeLens.package.version,
        info.latestStableVersion,
        codeLens
      );
    })
    .catch(error => {
      if (error.status == 404) return CommandFactory.createPackageNotFoundCommand(codeLens);

      logErrorToConsole("Pub", "evaluateCodeLens", codeLens.package.name, error);
      return CommandFactory.createPackageUnexpectedError(codeLens.package.name);
    });

}
      */


}

// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import DubConfig from 'providers/pub/config';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from "presentation/providers/abstract/abstractVersionLensProvider";
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { extractPackageDependenciesFromYaml } from "providers/pub/pubPackageParser";
import { fetchPubPackage } from 'providers/pub/pubApiClient';

export class PubCodeLensProvider extends AbstractVersionLensProvider {

  constructor() {
    super(DubConfig.provider);
  }

  get selector() {
    return {
      language: "yaml",
      scheme: "file",
      pattern: "**/pubspec.yaml"
    };
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    const packageDepsLenses = extractPackageDependenciesFromYaml(
      document.getText(),
      DubConfig.getDependencyProperties()
    );
    if (packageDepsLenses.length === 0) return Promise.resolve([]);

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      this.logger,
      fetchPubPackage,
      null
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

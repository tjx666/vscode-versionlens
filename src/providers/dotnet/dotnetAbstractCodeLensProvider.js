/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as httpRequest from 'request-light';
import * as jsonParser from 'vscode-contrib-jsonc';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';

// TODO retrieve multiple sources from nuget.config
const FEED_URL = 'https://api.nuget.org/v3-flatcontainer';

export class DotNetAbstractCodeLensProvider extends AbstractCodeLensProvider {

  resolveCodeLens(codeLens, token) {
    if (codeLens instanceof PackageCodeLens)
      return this.evaluateCodeLens(codeLens);
  }

  evaluateCodeLens(codeLens) {
    if (codeLens.command && codeLens.command.command.includes('updateDependenciesCommand'))
      return codeLens;

    if (codeLens.package.version === 'latest')
      return CommandFactory.makeLatestCommand(codeLens);

    const queryUrl = `${FEED_URL}/${codeLens.package.name}/index.json`;
    return httpRequest.xhr({ url: queryUrl })
      .then(response => {
        if (response.status != 200)
          return CommandFactory.makeErrorCommand(
            response.responseText,
            codeLens
          );

        const pkg = JSON.parse(response.responseText);
        const serverVersion = pkg.versions[pkg.versions.length - 1];
        if (!serverVersion)
          return CommandFactory.makeErrorCommand(
            "Invalid object returned from server",
            codeLens
          );

        return CommandFactory.makeVersionCommand(
          codeLens.package.version,
          serverVersion,
          codeLens
        );

      })
      .catch(errResponse => {
        console.error(`${errResponse.status}: ${queryUrl}`);
        return CommandFactory.makeErrorCommand(
          "An error occurred retrieving this package.",
          codeLens
        );
      })
  }

  createRequestUrl_(baseUrl, packageId) {
    return `${baseUrl}/${packageId}/index.json`;
  }

  extractVersionFromXml_(xmlResponse) {
    const versionExp = /<d:Version>(.*)<\/d:Version>/;
    const results = xmlResponse.match(versionExp);
    return results && results.length > 1 ? results[1] : '';
  }

  getPackageSources_() {
    return [''];
  }
}
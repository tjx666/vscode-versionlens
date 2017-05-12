/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as xmldoc from 'xmldoc';
import * as CommandFactory from '../commandFactory';
import appSettings from '../../common/appSettings';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { Range } from 'vscode';
import { appConfig } from '../../common/appConfiguration';
import { parseDependencyNodes } from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';
import { dotnetVersionParser } from './dotnetParser.js';
import { clearDecorations } from '../../editor/decorations';

export class DotNetCodeLensProvider extends AbstractCodeLensProvider {

  get selector() {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: '**/*.{csproj,fsproj}'
    }
  }

  provideCodeLenses(document, token) {
    clearDecorations();

    if (appSettings.showVersionLenses === false)
      return;

    const xmlDocument = new xmldoc.XmlDocument(document.getText());

    const dependencyNodes = this.extractDependencyNodes(
      document,
      xmlDocument
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appConfig,
      dotnetVersionParser
    );

    return generateCodeLenses(packageCollection, document);
  }

  evaluateCodeLens(codeLens) {
    // check if this is a tagged version
    if (codeLens.isTaggedVersion())
      return CommandFactory.makeTaggedVersionCommand(codeLens);

    // check if this is a fixed version
    if (codeLens.isFixedVersion())
      return CommandFactory.makeFixedVersionCommand(codeLens);

    // check if this is set to the latest version
    if (codeLens.package.version === 'latest')
      return CommandFactory.makeLatestCommand(codeLens);

    const latestVersion = codeLens.package.meta.tag.version;
    return CommandFactory.makeVersionCommand(
      codeLens.package.version,
      latestVersion,
      codeLens
    );
  }

  extractDependencyNodes(document, xmlDocument) {
    const packageDependencyKeys = appConfig.dotnetCSProjDependencyProperties;

    const nodes = [];
    xmlDocument.eachChild(group => {
      if (group.name !== 'ItemGroup') return;
      group.eachChild(child => {
        if (!packageDependencyKeys.includes(child.name)) return;

        const line = document.getText(
          new Range(
            document.positionAt(child.startTagPosition - 1),
            document.positionAt(child.position)
          )
        );

        const start = line.indexOf(' Version="') + 9;
        const end = line.indexOf('"', start + 1);
        nodes.push({
          start: child.startTagPosition + start - 1,
          end: child.startTagPosition + end,
          name: child.attr.Include,
          value: child.attr.Version,
          replaceInfo: {
            start: child.startTagPosition + start - 1,
            end: child.startTagPosition + end,
          }
        });
      });
    });

    return nodes;
  }

  extractVersionFromXml_(xmlResponse) {
    const versionExp = /<d:Version>(.*)<\/d:Version>/;
    const results = xmlResponse.match(versionExp);
    return results && results.length > 1 ? results[1] : '';
  }

}
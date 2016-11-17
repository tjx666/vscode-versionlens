/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from '../../common/di';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { bowerVersionParser } from './bowerVersionParser';

@inject('jsonParser', 'bower', 'appConfig')
export class BowerCodeLensProvider extends AbstractCodeLensProvider {

  constructor() {
    this.packageDependencyKeys = ['dependencies', 'devDependencies'];
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/bower.json'
    }
  };

  provideCodeLenses(document, token) {
    const jsonDoc = this.jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const collector = new PackageCodeLensList(document, this.appConfig);
    this.collectDependencies_(collector, jsonDoc.root, bowerVersionParser);
    return collector.collection;
  }

  resolveCodeLens(codeLensItem, token) {
    if (codeLensItem instanceof PackageCodeLens) {
      if (codeLensItem.package.version === 'latest') {
        this.commandFactory.makeLatestCommand(codeLensItem);
        return;
      }

      if (codeLensItem.package.meta) {
        if (codeLensItem.package.meta.type === 'github')
          return this.commandFactory.makeGithubCommand(codeLensItem);

        if (codeLensItem.package.meta.type === 'file')
          return this.commandFactory.makeLinkCommand(codeLensItem);
      }

      return new Promise(success => {
        this.bower.commands.info(codeLensItem.package.name)
          .on('end', info => {
            if (!info || !info.latest) {
              success(this.commandFactory.makeErrorCommand("Invalid object returned from server", codeLensItem));
              return;
            }
            success(this.commandFactory.makeVersionCommand(codeLensItem.package.version, info.latest.version, codeLensItem));
          })
          .on('error', (err) => {
            success(this.commandFactory.makeErrorCommand(err.message, codeLensItem));
          });
      });
    }
  }

}
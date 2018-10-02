/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { TestFixtureMap } from 'test/unit/utils';
import { PackageCodeLens } from 'common/packageCodeLens';
import { bowerDefaultDependencyProperties } from 'providers/bower/config';
import { BowerCodeLensProvider } from 'providers/bower/bowerCodeLensProvider';
import * as BowerAPIModule from 'providers/bower/bowerAPI';

const assert = require('assert');
const vscode = require('vscode');

const fixtureMap = new TestFixtureMap('./fixtures');

let testContext = null

export const BowerCodeLensProviderTests = {

  beforeEach: () => {
    testContext = {}
    testContext.testProvider = new BowerCodeLensProvider();

    // default api mocks
    BowerAPIModule.bowerGetPackageInfo = name => {
      return Promise.resolve({
        latest: {
          version: '3.2.1'
        }
      });
    };
  },

  "provideCodeLenses": {

    "returns empty array when the document json is invalid": done => {
      let fixture = fixtureMap.read('package-invalid.json');

      let testDocument = {
        getText: range => fixture.content,
        uri: {
          fsPath: ''
        },
        fileName: 'bower.json'
      };

      let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.ok(collection.length === 0, "codeLens should be an empty array.");
          done();
        })
        .catch(err => done(err));
    },

    "returns empty array when the document text is empty": done => {
      let testDocument = {
        getText: range => '',
        uri: {
          fsPath: ''
        },
        fileName: 'bower.json'
      };

      let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.ok(collection.length === 0, "codeLens should be an empty array.");
          done();
        })
        .catch(err => done(err));
    },

    "returns empty array when the package has no dependencies": done => {
      let fixture = fixtureMap.read('package-no-deps.json');
      let testDocument = {
        getText: range => fixture.content,
        uri: {
          fsPath: ''
        },
        fileName: 'filename.json'
      };

      let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.ok(collection.length === 0, "codeLens should be an empty array.");
          done();
        })
        .catch(err => done(err));
    },

    "returns array of given dependencies to be resolved": done => {
      let fixture = fixtureMap.read('package-with-deps.json');

      let testDocument = {
        getText: (range) => fixture.content,
        uri: {
          fsPath: ''
        },
        positionAt: (offset) => new vscode.Position(0, 0),
        fileName: fixture.basename
      };

      let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.equal(collection.length, 4, "codeLens should be an array containing 4 items.");

          collection.forEach((entry, index) => {
            assert.equal(entry.package.name, `dep${index + 1}`, `dependency name should be dep${index + 1}.`);
          });

          done();
        })
        .catch(err => done(err));
    }
  },

  "evaluateCodeLens": {

    "when code lens package version is 'latest' codeLens should return LatestCommand": () => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: 'latest', meta: {} }, null);
      testContext.testProvider.evaluateCodeLens(codeLens, null);
      assert.equal(codeLens.command.title, 'Latest', "Expected command.title failed.");
      assert.equal(codeLens.command.command, undefined);
      assert.equal(codeLens.command.arguments, undefined);
    },

    "when null info object returned from bower then codeLens should return ErrorCommand": done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);

      BowerAPIModule.bowerGetPackageInfo = (name, localPath) => {
        return Promise.reject({
          status: 500,
          responseText: "Invalid object returned from server for 'SomePackage'"
        });
      };

      testContext.testProvider.evaluateCodeLens(codeLens, null)
        .then(result => {
          assert.equal(result.command.title, "An error occurred retrieving 'SomePackage' package", "Expected command.title failed.");
          assert.equal(result.command.command, undefined);
          assert.equal(result.command.arguments, undefined);
          done();
        });
    },

    "when valid info.latest object returned from bower then codeLens should return VersionCommand": done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { tag: { name: 'satisfies', isPrimaryTag: true } } }, null);

      BowerAPIModule.bowerGetPackageInfo = name => {
        return Promise.resolve({
          latest: {
            version: '3.2.1'
          }
        });
      };

      testContext.testProvider.evaluateCodeLens(codeLens, null)
        .then(result => {
          assert.equal(result.command.title, '\u2191 3.2.1');
          assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
          assert.equal(result.command.arguments[1], '3.2.1');
          done();
        });
    }

  }

}
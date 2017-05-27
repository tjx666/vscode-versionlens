/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { TestFixtureMap, generatePackage } from 'test/unit/utils';
import { PackageCodeLens } from 'common/packageCodeLens';
import appSettings from 'common/appSettings';
import { NpmCodeLensProvider } from 'providers/npm/npmCodeLensProvider';
import * as npmAPIModule from 'providers/npm/npmAPI';

const assert = require('assert');
const vscode = require('vscode');

const fixtureMap = new TestFixtureMap('./fixtures');

let testContext = null;

export const NpmCodeLensProviderTests = {

  beforeEach: () => {
    testContext = {};
    testContext.testProvider = new NpmCodeLensProvider();

    testContext.testRange = new vscode.Range(
      new vscode.Position(1, 1),
      new vscode.Position(1, 2)
    );

    // default api mocks
    npmAPIModule.npmGetOutdated = _ => Promise.resolve({})
    npmAPIModule.npmViewVersion = _ => Promise.resolve({})
    npmAPIModule.npmViewDistTags = _ => Promise.resolve([])

    // mock app settings
    testContext.showDependencyStatusesMock = false;
    Reflect.defineProperty(
      appSettings,
      "showDependencyStatuses", {
        get: () => testContext.showDependencyStatusesMock
      }
    )
  },

  "provideCodeLenses": {

    "returns empty array when the document json is invalid": done => {
      let fixture = fixtureMap.read('package-invalid.json');

      let testDocument = {
        getText: range => fixture.content,
        uri: {
          fsPath: ''
        }
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
        }
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
        fileName: "filename.json",
        uri: {
          fsPath: ''
        }
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
        getText: range => fixture.content,
        positionAt: offset => new vscode.Position(0, 0),
        fileName: fixture.basename,
        uri: {
          fsPath: ''
        }
      };

      // mock the api
      npmAPIModule.npmViewVersion = viewVersionParam => {
        const [, packageName, maxSatisfyingVersion] = /(.*)@(.*)/.exec(viewVersionParam)
        return Promise.resolve(maxSatisfyingVersion)
      }

      npmAPIModule.npmViewDistTags = packageName => {
        return Promise.resolve([
          { name: 'latest', version: '5.0.0' },
          { name: 'next', version: '2000.0.0' }
        ])
      }

      let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.equal(collection.length, 8, `codeLens should be an array containing 8 items but instead was ${collection.length}`);

          assert.equal(
            collection[0].package.name,
            `dep1`,
            `dependency name should be dep1`
          );

          assert.equal(
            collection[2].package.name,
            `dep2`,
            `dependency name should be dep2`
          );

          assert.equal(
            collection[4].package.name,
            `dep3`,
            `dependency name should be dep3`
          );

          assert.equal(
            collection[6].package.name,
            `dep4`,
            `dependency name should be dep4`
          );

          done();
        })
        .catch(err => done(err));
    }

  },

  "evaluateCodeLens": {

    "returns not found": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', null, { type: 'npm', packageNotFound: true }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'SomePackage could not be found', "Expected command.title failed.");
      assert.equal(result.command.command, undefined);
      assert.equal(result.command.arguments, undefined);
    },

    "returns tagged versions": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'alpha', version: '3.3.3-alpha.1', isPrimaryTag: false } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'alpha: \u2191 3.3.3-alpha.1', "Expected command.title failed.");
      assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(result.command.arguments[1], '"3.3.3-alpha.1"');
    },

    "returns fixed versions": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isFixedVersion: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Fixed to 3.3.3', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    },

    "returns prerelease versions": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', isFixedVersion: true, tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isNewerThanLatest: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Prerelease', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    },

    "returns latest version matches": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isLatestVersion: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Latest', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    },

    "returns satisfies latest version": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, satisfiesLatest: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Satisfies latest', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    },

    "returns updatable versions": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '1.2.3', { type: 'npm', tag: { name: 'satisfies', version: '3.2.1', isPrimaryTag: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, '\u2191 3.2.1');
      assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(result.command.arguments[1], '"3.2.1"');
    }

  }

}
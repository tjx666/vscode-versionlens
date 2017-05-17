/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as proxyquire from 'proxyquire';
import * as assert from 'assert';
import * as semver from 'semver';
import * as path from 'path';
import * as vscode from 'vscode';
import { TestFixtureMap, generatePackage } from '../../../testUtils';
import { npmDefaultDependencyProperties } from '../../../../src/providers/npm/config';
import { PackageCodeLens } from '../../../../src/common/packageCodeLens';

describe("NpmCodeLensProvider", () => {
  const testPath = path.join(__dirname, '../../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  let defaultNpmDependencyKeys = npmDefaultDependencyProperties;
  const npmMock = {
    load: cb => cb(),
    view: x => x,
    outdated: (err, response) => { },
    dir: 'some/path/node_modules',
    config: {
      set: (key, value) => { }
    }
  };

  const appConfigMock = {
    get npmDependencyProperties() {
      return defaultNpmDependencyKeys;
    },
    get githubCompareOptions() {
      return ['Releases'];
    }
  }

  const NpmAPIModule = proxyquire('../../../../src/providers/npm/npmAPI', {
    'npm': npmMock
  });

  NpmAPIModule.npmViewDistTags = packageName => {
    return Promise.resolve([{
      name: 'latest',
      version: '5.0.0'
    }, {
      name: 'beta',
      version: '5.0.0-beta.1'
    }]);
  }

  NpmAPIModule.npmGetOutdated = _ => Promise.resolve([]);
  NpmAPIModule.npmViewVersion = _ => Promise.resolve("1.2.3");

  const NpmVersionParserModule = proxyquire('../../../../src/providers/npm/npmVersionParser', {
    './npmAPI': NpmAPIModule
  });

  const NpmCodeLensProviderModule = proxyquire('../../../../src/providers/npm/npmCodeLensProvider', {
    './npmAPI': NpmAPIModule,
    './npmVersionParser': NpmVersionParserModule,
    '../../common/appConfiguration': {
      appConfig: appConfigMock
    }
  });

  let testProvider;
  let testRange;

  beforeEach(() => {
    testProvider = new NpmCodeLensProviderModule.NpmCodeLensProvider();
    testRange = new vscode.Range(
      new vscode.Position(1, 1),
      new vscode.Position(1, 2)
    );

    npmMock.view = (testPackageName, arg, cb) => {
      let err = null
      let resp = { '1.2.3': { version: '1.2.3' } };
      cb(err, resp);
    };
  });

  describe("provideCodeLenses", () => {

    it("returns empty array when the document json is invalid", done => {
      let fixture = fixtureMap.read('package-invalid.json');

      let testDocument = {
        getText: range => fixture.content,
        uri: {
          fsPath: ''
        }
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.ok(collection.length === 0, "codeLens should be an empty array.");
          done();
        })
        .catch(console.log.bind(this));
    });

    it("returns empty array when the document text is empty", done => {
      let testDocument = {
        getText: range => '',
        uri: {
          fsPath: ''
        }
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.ok(collection.length === 0, "codeLens should be an empty array.");
          done();
        })
        .catch(console.log.bind(this));
    });

    it("returns empty array when the package has no dependencies", done => {
      let fixture = fixtureMap.read('package-no-deps.json');

      let testDocument = {
        getText: range => fixture.content,
        fileName: "filename.json",
        uri: {
          fsPath: ''
        }
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.ok(collection.length === 0, "codeLens should be an empty array.");
          done();
        })
        .catch(console.log.bind(this));
    });

    it("returns array of given dependencies to be resolved", done => {
      let fixture = fixtureMap.read('package-with-deps.json');

      let testDocument = {
        getText: range => fixture.content,
        positionAt: offset => new vscode.Position(0, 0),
        fileName: fixture.basename,
        uri: {
          fsPath: ''
        }
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.equal(collection.length, 8, "codeLens should be an array containing 8 items.");

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
        .catch(console.log.bind(this));
    });

  });

  describe("evaluateCodeLens", () => {

    it("returns not found", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', null, { type: 'npm', packageNotFound: true }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'SomePackage could not be found', "Expected command.title failed.");
      assert.equal(result.command.command, undefined);
      assert.equal(result.command.arguments, undefined);
    });

    it("returns tagged versions", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', isTaggedVersion: true, tag: { name: 'alpha', version: '3.3.3-alpha.1' } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'alpha: ⮬ 3.3.3-alpha.1', "Expected command.title failed.");
      assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(result.command.arguments[1], '"3.3.3-alpha.1"');
    });

    it("returns fixed versions", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'satisfies', version: '3.3.3', isFixedVersion: true } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Fixed to 3.3.3', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    });

    it("returns prerelease versions", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', isFixedVersion: true, tag: { name: 'satisfies', version: '3.3.3', isNewerThanLatest: true } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Prerelease', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    });

    it("returns latest version matches", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'satisfies', version: '3.3.3', isLatestVersion: true } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Latest', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    });

    it("returns satisfies latest version", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'satisfies', version: '3.3.3', satisfiesLatest: true } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Satisfies latest', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    });

    it("returns updatable versions", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '1.2.3', { type: 'npm', tag: { name: 'satisfies', version: '3.2.1' } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, '⮬ 3.2.1');
      assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(result.command.arguments[1], '"3.2.1"');
    });

  });

});
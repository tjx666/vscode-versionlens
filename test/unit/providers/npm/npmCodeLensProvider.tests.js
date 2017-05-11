/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as proxyquire from 'proxyquire';
import * as assert from 'assert';
import * as semver from 'semver';
import * as path from 'path';
import * as vscode from 'vscode';
import { TestFixtureMap } from '../../../testUtils';
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
      version: 'latest'
    }, {
      name: 'beta',
      version: 'beta'
    }]);
  }

  NpmAPIModule.npmGetOutdated = _ => Promise.resolve([]);

  const NpmVersionParserModule = proxyquire('../../../../src/providers/npm/npmVersionParser', {
    './npmAPI': NpmAPIModule
  });

  const NpmCodeLensProviderModule = proxyquire('../../../../src/providers/npm/npmCodeLensProvider', {
    './npmVersionParser': NpmVersionParserModule,
    '../../common/appConfiguration': {
      appConfig: appConfigMock
    }
  });

  let testProvider;

  beforeEach(() => {
    testProvider = new NpmCodeLensProviderModule.NpmCodeLensProvider();
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

    it("passes given package name to npm view", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { isValidSemver: true } }, null);
      npmMock.view = (testPackageName, arg, cb) => {
        assert.equal(testPackageName, 'SomePackage', "Expected npm.view(name) but failed.");
        let err = null;
        let resp = { '1.2.3': { version: '1.2.3' } };
        cb(err, resp);
        done();
      };
      testProvider.evaluateCodeLens(codeLens, null);
    });

    it("passes scoped package names with @ symbol to npm.view", done => {
      const packageName = '@SomeScope/SomePackage';
      const packageVersion = '1.2.3';
      const codeLens = new PackageCodeLens(null, null, { name: packageName, version: packageVersion, meta: { isValidSemver: true } }, null);
      npmMock.view = (testPackageName, arg, cb) => {
        const expected = `${packageName}`;
        assert.equal(testPackageName, expected, `Expected 'npm.view ${expected}' but got ${testPackageName}`);
        let err = null
        let resp = { '1.2.3': { version: '1.2.3' } };
        cb(err, resp);
        done();
      };
      testProvider.evaluateCodeLens(codeLens, null);
    });

    it("passes ranged version to npm.view", done => {
      const packageName = '@SomeScope/SomePackage';
      const packageVersion = '~1.2.3';
      const codeLens = new PackageCodeLens(null, null, { name: packageName, version: packageVersion, meta: { isValidSemver: true, isFixedVersion: false } }, null);
      npmMock.view = (testPackageName, arg, cb) => {
        const expected = `${packageName}@${packageVersion}`;
        assert.equal(testPackageName, expected, `Expected 'npm.view ${expected}' but got ${testPackageName}`);
        let err = null
        let resp = { '1.2.3': { version: '1.2.3' } };
        cb(err, resp);
        done();
      };
      testProvider.evaluateCodeLens(codeLens, null);
    });

    it("when npm view returns a 404 codeLens when E404 is set", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: 'E404', meta: { isValidSemver: true } }, null);
      // debugger
      npmMock.view = (testPackageName, arg, cb) => {
        let err = "npm.view 404";
        cb(err);
      };

      testProvider.evaluateCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, 'SomePackage could not be found', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });
    });

    it("when npm view returns an unhandled error then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { isValidSemver: true } }, null);
      // debugger
      npmMock.view = (testPackageName, arg, cb) => {
        let err = "npm.view failed";
        cb(err);
      };

      testProvider.evaluateCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, 'An error occurred retrieving this package.', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });
    });

    it("when a valid response returned from npm and package version is 'not latest' then codeLens should return NewVersionCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { isValidSemver: true } }, null);
      npmMock.view = (testPackageName, arg, cb) => {
        assert.equal(testPackageName, 'SomePackage', "Expected npm.view(name) but failed.");
        let err = null;
        let resp = { '3.2.1': { version: '3.2.1' } };
        cb(err, resp);
      };

      testProvider.evaluateCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, '⮬ 3.2.1');
        assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
        assert.equal(result.command.arguments[1], '"3.2.1"');
        done();
      });
    });

  });

});
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
    view: x => x
  };
  const appConfigMock = {
    get npmDependencyProperties() {
      return defaultNpmDependencyKeys;
    },
    get githubCompareOptions() {
      return ['Releases'];
    }
  }

  const NpmApiModule = proxyquire('../../../../src/providers/npm/npmAPI', {
    'npm': npmMock
  });

  const NpmCodeLensProviderModule = proxyquire('../../../../src/providers/npm/npmCodeLensProvider', {
    'NpmViewVersion': NpmApiModule.NpmViewVersion,
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
        getText: range => fixture.content
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
        getText: range => ''
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
        getText: range => fixture.content
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
        fileName: fixture.basename
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.equal(collection.length, 5, "codeLens should be an array containing 5 items inc <update all>.");

          collection.slice(1)
            .forEach((entry, index) => {
              assert.equal(entry.package.name, `dep${index + 1}`, `dependency name should be dep${index + 1}.`);
            });

          done();
        })
        .catch(console.log.bind(this));
    });

  });

  describe("evaluateCodeLens", () => {

    it("passes given package name to npm view", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', isValidSemver: true }, null);
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
      const codeLens = new PackageCodeLens(null, null, { name: packageName, version: packageVersion, isValidSemver: true }, null);
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
      const codeLens = new PackageCodeLens(null, null, { name: packageName, version: packageVersion, isValidSemver: true, hasRangeSymbol: true }, null);
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

    it("when npm view returns an error then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', isValidSemver: true }, null);
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
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', isValidSemver: true }, null);
      npmMock.view = (testPackageName, arg, cb) => {
        assert.equal(testPackageName, 'SomePackage', "Expected npm.view(name) but failed.");
        let err = null;
        let resp = { '3.2.1': { version: '3.2.1' } };
        cb(err, resp);
      };

      testProvider.evaluateCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, '⬆ 3.2.1');
        assert.equal(result.command.command, '_versionlens.updateDependencyCommand');
        assert.equal(result.command.arguments[1], '"3.2.1"');
        done();
      });
    });

  });

});
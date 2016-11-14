/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as assert from 'assert';
import * as semver from 'semver';
import * as path from 'path';
import * as vscode from 'vscode';
import { register, clear } from '../../../src/common/di';
import { TestFixtureMap } from '../../testUtils';
import { NpmCodeLensProvider } from '../../../src/providers/npm/npmCodeLensProvider';
import { AppConfiguration } from '../../../src/common/appConfiguration';
import { PackageCodeLens } from '../../../src/common/packageCodeLens';
import { CommandFactory } from '../../../src/providers/commandFactory';
import * as jsonParser from 'vscode-contrib-jsonc';

const jsonExt = vscode.extensions.getExtension('vscode.json');

describe("NpmCodeLensProvider", () => {
  const testPath = path.join(__dirname, '../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  let testProvider;
  let npmMock = {
    load: cb => cb()
  };
  let appConfigMock = new AppConfiguration();
  let defaultVersionPrefix;
  Object.defineProperty(appConfigMock, 'versionPrefix', { get: () => defaultVersionPrefix })

  beforeEach(() => {
    clear();
    register('semver', semver);
    register('jsonParser', jsonParser);
    register('npm', npmMock);
    register('appConfig', appConfigMock);
    register('commandFactory', new CommandFactory());
    // mock the config
    defaultVersionPrefix = '^';
    testProvider = new NpmCodeLensProvider();
  });

  describe("provideCodeLenses", () => {

    it("returns empty array when the document json is invalid", () => {
      let fixture = fixtureMap.read('package-invalid.json');

      let testDocument = {
        getText: range => fixture.content
      };

      let codeLens = testProvider.provideCodeLenses(testDocument, null);
      assert.ok(codeLens instanceof Array, "codeLens should be an array.");
      assert.ok(codeLens.length === 0, "codeLens should be an empty array.");
    });

    it("returns empty array when the document text is empty", () => {
      let testDocument = {
        getText: range => ''
      };

      let codeLens = testProvider.provideCodeLenses(testDocument, null);
      assert.ok(codeLens instanceof Array, "codeLens should be an array.");
      assert.ok(codeLens.length === 0, "codeLens should be an empty array.");
    });

    it("returns empty array when the package has no dependencies", () => {
      let fixture = fixtureMap.read('package-no-deps.json');

      let testDocument = {
        getText: range => fixture.content
      };

      let codeLens = testProvider.provideCodeLenses(testDocument, null);
      assert.ok(codeLens instanceof Array, "codeLens should be an array.");
      assert.ok(codeLens.length === 0, "codeLens should be an empty array.");
    });

    it("returns array of given dependencies to be resolved", () => {
      let fixture = fixtureMap.read('package-with-deps.json');

      let testDocument = {
        getText: range => fixture.content,
        positionAt: offset => new vscode.Position(0, 0),
        fileName: fixture.basename
      };

      let codeLens = testProvider.provideCodeLenses(testDocument, null);
      assert.ok(codeLens instanceof Array, "codeLens should be an array.");
      assert.equal(codeLens.length, 4, "codeLens should be an array containing 4 items.");

      codeLens.forEach((entry, index) => {
        assert.equal(entry.packageName, `dep${index + 1}`, `dependency name should be dep${index + 1}.`);
      });
    });

  });

  describe("resolveCodeLens", () => {

    it("passes given package name to npm view", done => {
      const codeLens = new PackageCodeLens(null, null, null, 'SomePackage', '1.2.3', null, true, null);
      npmMock.view = (testPackageName, arg, cb) => {
        assert.equal(testPackageName, 'SomePackage', "Expected npm.view(packageName) but failed.");
        let err = null;
        let resp = { '1.2.3': { version: '1.2.3' } };
        cb(err, resp);
        done();
      };
      testProvider.resolveCodeLens(codeLens, null);
    });

    it("passes scoped package names with @ symbol to npm.view", done => {
      const codeLens = new PackageCodeLens(null, null, null, '@SomeScope/SomePackage', '1.2.3', null, true, null);
      npmMock.view = (testPackageName, arg, cb) => {
        assert.equal(testPackageName, '@SomeScope/SomePackage', "Expected npm.view(packageName) but failed.");
        let err = null
        let resp = { '1.2.3': { version: '1.2.3' } };
        cb(err, resp);
        done();
      };
      testProvider.resolveCodeLens(codeLens, null);
    });

    it("when npm view returns an error then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, null, 'SomePackage', '1.2.3', null, true, null);
      // debugger
      npmMock.view = (testPackageName, arg, cb) => {
        let err = "An error occurred";
        cb(err);
      };

      testProvider.resolveCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, 'An error occurred', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });
    });

    it("when a valid response returned from npm and package version is 'not latest' then codeLens should return NewVersionCommand", done => {
      const codeLens = new PackageCodeLens(null, null, null, 'SomePackage', '1.2.3', null, true, null);
      npmMock.view = (testPackageName, arg, cb) => {
        assert.equal(testPackageName, 'SomePackage', "Expected npm.view(packageName) but failed.");
        let err = null;
        let resp = { '3.2.1': { version: '3.2.1' } };
        cb(err, resp);
      };

      testProvider.resolveCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, '⬆ ^3.2.1');
        assert.equal(result.command.command, '_versionlens.updateDependencyCommand');
        assert.equal(result.command.arguments[1], '"^3.2.1"');
        done();
      });
    });

  });

});
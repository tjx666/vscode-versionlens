/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as assert from 'assert';
import * as semver from 'semver';
import * as path from 'path';
import * as vscode from 'vscode';
import * as jsonParser from 'vscode-contrib-jsonc';
import { register, clear } from '../../../../src/common/di';
import { TestFixtureMap } from '../../../testUtils';
import { BowerCodeLensProvider } from '../../../../src/providers/bower/bowerCodeLensProvider';
import { bowerDefaultDependencyProperties } from '../../../../src/providers/bower/config';
import { AppConfiguration } from '../../../../src/common/appConfiguration';
import { CommandFactory } from '../../../../src/providers/commandFactory';
import { PackageCodeLens } from '../../../../src/common/packageCodeLens';

describe("BowerCodeLensProvider", () => {
  const testPath = path.join(__dirname, '../../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  let bowerMock;
  let testProvider;

  let appConfigMock;
  let defaultVersionPrefix = '^';
  let bowerDependencyProperties = bowerDefaultDependencyProperties;

  beforeEach(() => {
    bowerMock = {
      commands: {
        info: null
      }
    };

    clear();

    appConfigMock = new AppConfiguration();
    Object.defineProperty(appConfigMock, 'versionPrefix', { get: () => defaultVersionPrefix })
    Object.defineProperty(appConfigMock, 'bowerDependencyProperties', { get: () => bowerDependencyProperties })

    register('bower', bowerMock);
    register('semver', semver);
    register('jsonParser', jsonParser);
    register('appConfig', appConfigMock);
    register('commandFactory', new CommandFactory());

    testProvider = new BowerCodeLensProvider();
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
        getText: (range) => fixture.content,
        positionAt: (offset) => new vscode.Position(0, 0),
        fileName: fixture.basename
      };

      let codeLens = testProvider.provideCodeLenses(testDocument, null);
      assert.ok(codeLens instanceof Array, "codeLens should be an array.");
      assert.equal(codeLens.length, 5, "codeLens should be an array containing 5 items inc <update all>.");

      codeLens.slice(1)
        .forEach((entry, index) => {
          assert.equal(entry.package.name, `dep${index + 1}`, `dependency name should be dep${index + 1}.`);
        });
    });
  });

  describe("resolveCodeLens", () => {

    it("when code lens package version is 'latest' codeLens should return LatestCommand", () => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: 'latest', isValidSemver: true }, null);
      testProvider.resolveCodeLens(codeLens, null);
      assert.equal(codeLens.command.title, 'latest', "Expected command.title failed.");
      assert.equal(codeLens.command.command, undefined);
      assert.equal(codeLens.command.arguments, undefined);
    });

    it("when null info object returned from bower then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', isValidSemver: true }, null);
      bowerMock.commands.info = name => {
        let result;
        result = {
          on: (eventName, callback) => {
            if (eventName === 'end')
              callback(null);
            return result;
          }
        };
        return result;
      };

      testProvider.resolveCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, 'Invalid object returned from server', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });
    });

    it("when null info.latest object returned from bower then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', isValidSemver: true }, null);
      bowerMock.commands.info = name => {
        let result;
        result = {
          on: (eventName, callback) => {
            if (eventName === 'end')
              callback({});
            return result;
          }
        };
        return result;
      };

      testProvider.resolveCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, 'Invalid object returned from server', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });
    });

    it("when valid info.latest object returned from bower then codeLens should return VersionCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', isValidSemver: true }, null);
      bowerMock.commands.info = name => {
        let result;
        result = {
          on: (eventName, callback) => {
            if (eventName === 'end')
              callback({ latest: { version: '3.2.1' } });
            return result;
          }
        };
        return result;
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
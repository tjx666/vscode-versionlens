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
import { dotnetCSProjDefaultDependencyProperties } from '../../../../src/providers/dotnet/config';
import { PackageCodeLens } from '../../../../src/common/packageCodeLens';

describe("DotNetCodeLensProvider", () => {
  const testPath = path.join(__dirname, '../../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  const npmMock = {
    load: cb => cb(),
    view: x => x,
    outdated: (err, response) => { },
    config: {
      set: (key, value) => { }
    }
  };

  const appConfigMock = {
    get dotnetDependencyProperties() {
      return dotnetCSProjDefaultDependencyProperties;
    }
  }

  const nugetAPIModuleMock = {
    nugetGetPackageVersions: function () { }
  };

  const DotNetVersionParserModule = proxyquire('../../../../src/providers/dotnet/dotnetVersionParser', {
    './nugetAPI': nugetAPIModuleMock
  });

  const DotNetCodeLensProviderModule = proxyquire('../../../../src/providers/dotnet/dotnetCodeLensProvider', {
    './dotnetVersionParser': DotNetVersionParserModule,
    '../../common/appConfiguration': {
      appConfig: appConfigMock
    }
  });

  let testProvider;
  let testRange;
  beforeEach(() => {
    testRange = new vscode.Range(
      new vscode.Position(1, 1),
      new vscode.Position(1, 2)
    );
    testProvider = new DotNetCodeLensProviderModule.DotNetCodeLensProvider();
  });

  describe("evaluateCodeLens", () => {

    it("returns not found", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', null, { type: 'nuget', packageNotFound: true }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'SomePackage could not be found', "Expected command.title failed.");
      assert.equal(result.command.command, undefined);
      assert.equal(result.command.arguments, undefined);
    });

    it("returns tagged versions", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'nuget', isTaggedVersion: true, tag: { name: 'alpha', version: '3.3.3-alpha.1' } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'alpha: ⮬ 3.3.3-alpha.1', "Expected command.title failed.");
      assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(result.command.arguments[1], '"3.3.3-alpha.1"');
    });

    it("returns fixed versions", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'nuget', tag: { name: 'satisfies', version: '3.3.3', isFixedVersion: true } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Fixed to 3.3.3', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    });

    it("returns prerelease versions", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'nuget', isFixedVersion: true, tag: { name: 'satisfies', version: '3.3.3', isNewerThanLatest: true } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Prerelease', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    });

    it("returns latest version matches", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'nuget', tag: { name: 'satisfies', version: '3.3.3', isLatestVersion: true } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Latest', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    });

    it("returns satisfies latest version", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'nuget', tag: { name: 'satisfies', version: '3.3.3', satisfiesLatest: true } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Satisfies latest', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    });

    it("returns updatable versions", () => {
      const codeLens = new PackageCodeLens(testRange, null, generatePackage('SomePackage', '1.2.3', { type: 'nuget', tag: { name: 'satisfies', version: '3.2.1' } }), null);
      const result = testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, '⮬ 3.2.1');
      assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(result.command.arguments[1], '"3.2.1"');
    });

  });

});
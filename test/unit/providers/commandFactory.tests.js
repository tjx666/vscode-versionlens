/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as assert from 'assert';
import * as semver from 'semver';
import { register, clear } from '../../../src/common/di';
import { AppConfiguration } from '../../../src/common/appConfiguration';
import { CommandFactory } from '../../../src/providers/commandFactory';
import { PackageCodeLens } from '../../../src/common/packageCodeLens'

describe("CommandFactory", () => {
  let testFactory;
  let appConfigMock = new AppConfiguration();
  let defaultVersionPrefix;
  Object.defineProperty(appConfigMock, 'versionPrefix', { get: () => defaultVersionPrefix })

  beforeEach(() => {
    clear();
    register('semver', semver);
    register('appConfig', appConfigMock)

    // mock the config
    defaultVersionPrefix = '^';
    testFactory = new CommandFactory();
    testFactory.makeTestVersionCommand = (localVersion, serverVersion) => {
      const lens = new PackageCodeLens(null, null, { version: localVersion }, null);
      return testFactory.makeVersionCommand(localVersion, serverVersion, lens);
    };
  });

  describe('makeVersionCommand', () => {

    it("when local version is invalid then should return ErrorCommand", () => {
      const testLens = testFactory.makeTestVersionCommand('blah', 'latest');
      assert.equal(testLens.command.title, 'Invalid semver version entered', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    });

    it("when server version is invalid then should return ErrorCommand", () => {
      const testLens = testFactory.makeTestVersionCommand('1.2.3', '1.0.0.5');
      assert.equal(testLens.command.title, 'Invalid semver server version received, 1.0.0.5', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    })

    it("when server and local version are 'latest' then codeLens should return LatestCommand", () => {
      const testLens = testFactory.makeTestVersionCommand('latest', 'latest');
      assert.equal(testLens.command.title, 'latest', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    });

    it("when local ranged version does not satisfy the server version then codeLens should return NewVersionCommand", () => {
      defaultVersionPrefix = '^';
      const testLens = testFactory.makeTestVersionCommand('1.0.0 - 2.0.0', '2.8.0');
      assert.equal(testLens.command.title, '⬆ ^2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, '_versionlens.updateDependencyCommand');
      assert.equal(testLens.command.arguments[1], '"^2.8.0"');
    });

    it("when local ranged version does not satisfy the server version then codeLens should return NewVersionCommand", () => {
      defaultVersionPrefix = '^';
      const testLens = testFactory.makeTestVersionCommand('1.0.0 - 2.0.0', '2.8.0');
      assert.equal(testLens.command.title, '⬆ ^2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, '_versionlens.updateDependencyCommand');
      assert.equal(testLens.command.arguments[1], '"^2.8.0"');
    });

    it("when local ranged version does satisfy the server version then codeLens should return SatisfiedCommand", () => {
      defaultVersionPrefix = '^';
      const testLens = testFactory.makeTestVersionCommand('1.0.0 - 3.0.0', '2.8.0');
      assert.equal(testLens.command.title, 'satisfies v2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    });

    it("when local version has caret and doesnt satisfies the server version then codeLens should return NewVersionCommand", () => {
      defaultVersionPrefix = '^';
      const testLens = testFactory.makeTestVersionCommand('^1.8.0', '2.8.0');
      assert.equal(testLens.command.title, '⬆ ^2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, '_versionlens.updateDependencyCommand');
      assert.equal(testLens.command.arguments[1], '"^2.8.0"');
    });

    it("when local version has caret and satisfies the server version (and matches) then codeLens should return SatisfiedCommand", () => {
      defaultVersionPrefix = '^';
      const testLens = testFactory.makeTestVersionCommand('^2.0.0', '2.0.0');
      assert.equal(testLens.command.title, 'satisfies v2.0.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    });

    it("when local version has caret and satisfies the server version then codeLens should return SatisfiedWithNewerCommand", () => {
      defaultVersionPrefix = '^';
      const testLens = testFactory.makeTestVersionCommand('^2.0.0', '2.8.0');
      assert.equal(testLens.command.title, '⬆ satisfies v2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, '_versionlens.updateDependencyCommand');
      assert.equal(testLens.command.arguments[1], '"^2.8.0"');
    });

    it("when local version does not satisfy the server version then codeLens should return NewVersionCommand", () => {
      defaultVersionPrefix = '^';
      const testLens = testFactory.makeTestVersionCommand('1.0.0', '2.8.0');
      assert.equal(testLens.command.title, '⬆ ^2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, '_versionlens.updateDependencyCommand');
      assert.equal(testLens.command.arguments[1], '"^2.8.0"');
    });

    it("when local version does satisfy the server version then codeLens should return LatestCommand", () => {
      defaultVersionPrefix = '^';
      const testLens = testFactory.makeTestVersionCommand('2.8.0', '2.8.0');
      assert.equal(testLens.command.title, 'latest', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    });

  });

});
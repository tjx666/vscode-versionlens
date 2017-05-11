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
import { bowerDefaultDependencyProperties } from '../../../../src/providers/bower/config';
import { PackageCodeLens } from '../../../../src/common/packageCodeLens';

describe("BowerCodeLensProvider", () => {
  const testPath = path.join(__dirname, '../../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  const bowerMock = {
    commands: {
      info: null
    }
  };

  const bowerDependencyProperties = bowerDefaultDependencyProperties;
  const appConfigMock = {
    get bowerDependencyProperties() {
      return bowerDependencyProperties;
    },
    get githubCompareOptions() {
      return ['Releases'];
    }
  };

  const BowerCodeLensProviderModule = proxyquire('../../../../src/providers/bower/bowerCodeLensProvider', {
    'bower': bowerMock,
    '../../common/appConfiguration': {
      appConfig: appConfigMock
    }
  });

  let testProvider;

  beforeEach(() => {
    testProvider = new BowerCodeLensProviderModule.BowerCodeLensProvider();

    bowerMock.commands.info = name => {
      return {
        on: (eventName, callback) => {
          if (eventName === 'end')
            callback({ latest: { version: '3.2.1' } });
        }
      };
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
        .catch(console.error.bind(this));
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
        .catch(console.error.bind(this));
    });

    it("returns empty array when the package has no dependencies", done => {
      let fixture = fixtureMap.read('package-no-deps.json');
      let testDocument = {
        getText: range => fixture.content,
        fileName: 'filename.json'
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.ok(collection.length === 0, "codeLens should be an empty array.");
          done();
        })
        .catch(console.error.bind(this));
    });

    it("returns array of given dependencies to be resolved", done => {
      let fixture = fixtureMap.read('package-with-deps.json');

      let testDocument = {
        getText: (range) => fixture.content,
        positionAt: (offset) => new vscode.Position(0, 0),
        fileName: fixture.basename
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null);
      Promise.resolve(codeLenses)
        .then(collection => {
          assert.ok(collection instanceof Array, "codeLens should be an array.");
          assert.equal(collection.length, 4, "codeLens should be an array containing 4 items.");

          collection.forEach((entry, index) => {
            assert.equal(entry.package.name, `dep${index + 1}`, `dependency name should be dep${index + 1}.`);
          });

          done();
        })
        .catch(console.error.bind(this));
    });
  });

  describe("evaluateCodeLens", () => {

    it("when code lens package version is 'latest' codeLens should return LatestCommand", () => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: 'latest', meta: { isValidSemver: true } }, null);
      testProvider.evaluateCodeLens(codeLens, null);
      assert.equal(codeLens.command.title, 'Matches latest', "Expected command.title failed.");
      assert.equal(codeLens.command.command, undefined);
      assert.equal(codeLens.command.arguments, undefined);
    });

    it("when null info object returned from bower then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { isValidSemver: true } }, null);
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

      testProvider.evaluateCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, 'Invalid object returned from server', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });
    });

    it("when null info.latest object returned from bower then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { isValidSemver: true } }, null);
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

      testProvider.evaluateCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, 'Invalid object returned from server', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });
    });

    it("when valid info.latest object returned from bower then codeLens should return VersionCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { isValidSemver: true } }, null);
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

      testProvider.evaluateCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, '⮬ 3.2.1');
        assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
        assert.equal(result.command.arguments[1], '"3.2.1"');
        done();
      });
    });

    it("when bower info returns an error then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { isValidSemver: true } }, null);
      bowerMock.commands.info = name => {
        let result;
        result = {
          on: (eventName, callback) => {
            if (eventName === 'error')
              callback("bower info error");
            return result;
          }
        };
        return result;
      };

      testProvider.evaluateCodeLens(codeLens, null).then(result => {
        assert.equal(result.command.title, 'An error occurred retrieving this package.');
        done();
      });
    });

  });
});
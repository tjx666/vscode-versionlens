/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as proxyquire from 'proxyquire';
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import * as jsonParser from 'vscode-contrib-jsonc';

import { TestFixtureMap } from '../../../testUtils';
import { dubDefaultDependencyProperties } from '../../../../src/providers/dub/config';
import { PackageCodeLens } from '../../../../src/common/packageCodeLens';

describe("DubCodeLensProvider", () => {
  const testPath = path.join(__dirname, '../../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  const dubAPIMock = {};
  let defaultDubDependencyKeys = dubDefaultDependencyProperties;

  const appConfigMock = {
    get dubDependencyProperties() {
      return defaultDubDependencyKeys;
    }
  }

  const DubAPIModule = proxyquire('../../../../src/providers/dub/dubAPI', {

  });

  const DubCodeLensProviderModule = proxyquire('../../../../src/providers/dub/dubCodeLensProvider', {
    './dubAPI.js': DubAPIModule,
    '../../common/appConfiguration': {
      appConfig: appConfigMock
    }
  });

  let testProvider;

  beforeEach(() => {
    testProvider = new DubCodeLensProviderModule.DubCodeLensProvider();

    // default mock handler for http requests
    DubAPIModule.dubGetPackageLatest = packageName => {
      return Promise.resolve({
        status: 200,
        responseText: null
      });
    };

    DubAPIModule.readDubSelections = filePath => {
      return Promise.resolve(null);
    }

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

      let codeLenses = testProvider.provideCodeLenses(testDocument, null)
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
        getText: range => '',
        uri: {
          fsPath: ''
        }
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null)
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
        fileName: 'filename.json',
        uri: {
          fsPath: ''
        }
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null)
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
        getText: range => fixture.content,
        positionAt: offset => new vscode.Position(0, 0),
        fileName: fixture.basename,
        uri: {
          fsPath: ''
        }
      };

      let codeLenses = testProvider.provideCodeLenses(testDocument, null)
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

    it("passes package name to dubGetPackageLatest", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);
      DubAPIModule.dubGetPackageLatest = packageName => {
        assert.equal(packageName, 'SomePackage', "Expected package name to equal SomePackage");
        done();
        return Promise.resolve({
          status: 200,
          responseText: null
        });
      };
      testProvider.evaluateCodeLens(codeLens, null);
    });

    it("when dub does not return status 200 then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);
      DubAPIModule.dubGetPackageLatest = packageName => {
        return Promise.reject({
          status: 404,
          responseText: 'Not found'
        });
      };

      testProvider.evaluateCodeLens(codeLens, null)
        .then(result => {
          assert.equal(result.command.title, 'SomePackage could not be found', "Expected command.title failed.");
          assert.equal(result.command.command, null);
          assert.equal(result.command.arguments, null);
          done();
        });
    });

    it("when null response object returned from dub then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);

      DubAPIModule.dubGetPackageLatest = packageName => {
        return Promise.resolve(null);
      };

      testProvider.evaluateCodeLens(codeLens, null)
        .then(result => {
          assert.equal(result.command.title, 'Invalid object returned from server', "Expected command.title failed.");
          assert.equal(result.command.command, undefined);
          assert.equal(result.command.arguments, undefined);
          done();
        });

    });

    it("when response is an error object then codeLens should return ErrorCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);

      DubAPIModule.dubGetPackageLatest = options => {
        return Promise.resolve({
          status: 200,
          responseText: '{"statusMessage": "Package not found"}'
        });
      };

      testProvider.evaluateCodeLens(codeLens, null)
        .then(result => {
          assert.equal(result.command.title, 'Invalid object returned from server', "Expected command.title failed.");
          assert.equal(result.command.command, undefined);
          assert.equal(result.command.arguments, undefined);
          done();
        });
    });

    it("when a valid response returned from dub and package version is 'not latest' then codeLens should return NewVersionCommand", done => {
      const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { tag: { name: 'satisfies', isPrimaryTag: true } } }, null);
      DubAPIModule.dubGetPackageLatest = options => {
        return Promise.resolve('3.2.1');
      };
      testProvider.evaluateCodeLens(codeLens, null)
        .then(result => {
          assert.equal(result.command.title, '\u2191 3.2.1');
          assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
          assert.equal(result.command.arguments[1], '"3.2.1"');
          done();
        });
    });

  });

});
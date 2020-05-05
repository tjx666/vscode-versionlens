/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { PackageErrors } from 'providers/shared/definitions';
import { PackageCodeLens } from 'providers/shared/packageCodeLens';
import { DubCodeLensProvider } from 'providers/dub/dubCodeLensProvider';
import * as DubAPIModule from 'providers/dub/dubAPI';
import { generatePackage } from 'test/unit/utils.js';
import appSettings from '/appSettings';

const assert = require('assert');

let testContext = null;

export default {

  beforeAll: () => {
    // default api mocks
    DubAPIModule.readDubSelections = filePath => {
      return Promise.resolve(null);
    }

    DubAPIModule.dubGetPackageLatest = packageName => {
      return Promise.resolve({
        status: 200,
        responseText: null
      });
    }

    Reflect.defineProperty(
      appSettings,
      "showVersionLenses", {
      get: () => true
    }
    )

  },

  beforeEach: () => {
    testContext = {};
    testContext.testProvider = new DubCodeLensProvider();
  },


  "passes package name to dubGetPackageLatest": done => {
    const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);
    DubAPIModule.dubGetPackageLatest = packageName => {
      assert.equal(packageName, 'SomePackage', "Expected package name to equal SomePackage");
      done();
      return Promise.resolve({
        status: 200,
        responseText: null
      });
    };
    testContext.testProvider.evaluateCodeLens(codeLens, null);
  },

  "when dub does not return status 200 then codeLens should return ErrorCommand": done => {
    const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);
    DubAPIModule.dubGetPackageLatest = packageName => {
      return Promise.reject({
        status: 404,
        responseText: 'Not found'
      });
    };

    testContext.testProvider.evaluateCodeLens(codeLens, null)
      .then(result => {
        assert.equal(result.command.title, 'SomePackage could not be found', "Expected command.title failed.");
        assert.equal(result.command.command, null);
        assert.equal(result.command.arguments, null);
        done();
      });
  },

  "when null response object returned from dub then codeLens should return ErrorCommand": done => {
    const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);

    DubAPIModule.dubGetPackageLatest = packageName => {
      return Promise.resolve(null);
    };

    testContext.testProvider.evaluateCodeLens(codeLens, null)
      .then(result => {
        assert.equal(result.command.title, 'Invalid object returned from server', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });

  },

  "when response is an error object then codeLens should return ErrorCommand": done => {
    const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);

    DubAPIModule.dubGetPackageLatest = options => {
      return Promise.resolve({
        status: 200,
        responseText: '{"statusMessage": "Package not found"}'
      });
    };

    testContext.testProvider.evaluateCodeLens(codeLens, null)
      .then(result => {
        assert.equal(result.command.title, 'Invalid object returned from server', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });
  },

  "when a valid response returned from dub and package version is 'not latest' then codeLens should return NewVersionCommand": done => {
    const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { tag: { name: 'satisfies', isPrimaryTag: true } } }, null);
    DubAPIModule.dubGetPackageLatest = options => {
      return Promise.resolve('3.2.1');
    };
    testContext.testProvider.evaluateCodeLens(codeLens, null)
      .then(result => {
        assert.equal(result.command.title, '\u2191 3.2.1');
        assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
        assert.equal(result.command.arguments[1], '3.2.1');
        done();
      });
  },

  "returns unexpected error command": () => {
    const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '1.2.3', { type: 'dub', error: PackageErrors.Unexpected, message: "" }), null);

    DubAPIModule.dubGetPackageLatest = options => {
      return Promise.reject({
        status: 500,
        responseText: '{"statusMessage": "Unexpected"}'
      });
    };

    testContext.testProvider.evaluateCodeLens(codeLens, null)
      .then(result => {
        assert.equal(result.command.title, 'Unexpected error. See dev tools console', "Expected command.title failed.");
        assert.equal(result.command.command, undefined);
        assert.equal(result.command.arguments, undefined);
        done();
      });
  },

}

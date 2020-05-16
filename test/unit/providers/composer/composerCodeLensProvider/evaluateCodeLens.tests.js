import editorSettings from 'presentation/editor/editorSettings';
import { PackageCodeLens } from 'providers/shared/packageCodeLens';
import { ComposerCodeLensProvider } from 'providers/composer/composerCodeLensProvider';
import * as ComposerAPIModule from 'providers/composer/composerAPI';

const assert = require('assert');

let testContext = null;

export default {

  beforeAll: () => {
    // default api mocks
    ComposerAPIModule.readComposerSelections = filePath => {
      return Promise.resolve(null);
    }

    ComposerAPIModule.composerGetPackageLatest = packageName => {
      return Promise.resolve({
        status: 200,
        responseText: null
      });
    }

    Reflect.defineProperty(
      editorSettings,
      "showVersionLenses", {
      get: () => true
    }
    )

  },

  beforeEach: () => {
    testContext = {};
    testContext.testProvider = new ComposerCodeLensProvider();
  },

  "passes package name to composerGetPackageLatest": done => {
    const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);
    ComposerAPIModule.composerGetPackageLatest = packageName => {
      assert.equal(packageName, 'SomePackage', "Expected package name to equal SomePackage");
      done();
      return Promise.resolve({
        status: 200,
        responseText: null
      });
    };
    testContext.testProvider.evaluateCodeLens(codeLens, null);
  },

  "when composer does not return status 200 then codeLens should return ErrorCommand": done => {
    const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);
    ComposerAPIModule.composerGetPackageLatest = packageName => {
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

  "when null response object returned from composer then codeLens should return ErrorCommand": done => {
    const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: {} }, null);

    ComposerAPIModule.composerGetPackageLatest = packageName => {
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

    ComposerAPIModule.composerGetPackageLatest = options => {
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

  "when a valid response returned from composer and package version is 'not latest' then codeLens should return NewVersionCommand": done => {
    const codeLens = new PackageCodeLens(null, null, { name: 'SomePackage', version: '1.2.3', meta: { tag: { name: 'satisfies', isPrimaryTag: true } } }, null);
    ComposerAPIModule.composerGetPackageLatest = options => {
      return Promise.resolve('3.2.1');
    };
    testContext.testProvider.evaluateCodeLens(codeLens, null)
      .then(result => {
        assert.equal(result.command.title, '\u2191 3.2.1');
        assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
        assert.equal(result.command.arguments[1], '3.2.1');
        done();
      });
  }



}

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { TestFixtureMap } from 'test/unit/utils';
import { DubCodeLensProvider } from 'providers/dub/dubCodeLensProvider';
import * as DubAPIModule from 'providers/dub/dubAPI';
import appSettings from 'common/appSettings.js';

const assert = require('assert');
const vscode = require('vscode');

const fixtureMap = new TestFixtureMap('./fixtures');

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

  "returns empty array when the document json is invalid": done => {
    let fixture = fixtureMap.read('package-invalid.json');

    let testDocument = {
      getText: range => fixture.content,
      uri: {
        fsPath: ''
      }
    };

    let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null)
    Promise.resolve(codeLenses)
      .then(collection => {
        assert.ok(collection instanceof Array, "codeLens should be an array.");
        assert.ok(collection.length === 0, "codeLens should be an empty array.");
        done();
      })
      .catch(err => done(err));
  },

  "returns empty array when the document text is empty": done => {
    let testDocument = {
      getText: range => '',
      uri: {
        fsPath: ''
      }
    };

    let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null)
    Promise.resolve(codeLenses)
      .then(collection => {
        assert.ok(collection instanceof Array, "codeLens should be an array.");
        assert.ok(collection.length === 0, "codeLens should be an empty array.");
        done();
      })
      .catch(err => done(err));
  },

  "returns empty array when the package has no dependencies": done => {
    let fixture = fixtureMap.read('package-no-deps.json');

    let testDocument = {
      getText: range => fixture.content,
      fileName: 'filename.json',
      uri: {
        fsPath: ''
      }
    };

    let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null)
    Promise.resolve(codeLenses)
      .then(collection => {
        assert.ok(collection instanceof Array, "codeLens should be an array.");
        assert.ok(collection.length === 0, "codeLens should be an empty array.");
        done();
      })
      .catch(err => done(err));
  },

  "returns array of given dependencies to be resolved": done => {
    let fixture = fixtureMap.read('package-with-deps.json');

    let testDocument = {
      getText: range => fixture.content,
      positionAt: offset => new vscode.Position(0, 0),
      fileName: fixture.basename,
      uri: {
        fsPath: ''
      }
    };

    let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null)
    Promise.resolve(codeLenses)
      .then(collection => {
        assert.ok(collection instanceof Array, "codeLens should be an array.");
        assert.equal(collection.length, 4, "codeLens should be an array containing 4 items.");

        collection.forEach((entry, index) => {
          assert.equal(entry.package.name, `dep${index + 1}`, `dependency name should be dep${index + 1}.`);
        });

        done();
      })
      .catch(err => done(err));
  }

}
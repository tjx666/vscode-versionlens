/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import appSettings from 'common/appSettings.js';
import { TestFixtureMap } from 'test/unit/utils.js';
import { NpmCodeLensProvider } from 'providers/npm/npmCodeLensProvider.js';
import * as npmClientModule from 'providers/npm/npmClient.js';

const assert = require('assert');
const vscode = require('vscode');

const fixtureMap = new TestFixtureMap('./fixtures');

let testContext = null;

export default {

  beforeEach: () => {
    testContext = {};
    testContext.testProvider = new NpmCodeLensProvider();

    testContext.testRange = new vscode.Range(
      new vscode.Position(1, 1),
      new vscode.Position(1, 2)
    );

    // default api mocks
    npmClientModule.npmGetOutdated = _ => Promise.resolve({})
    npmClientModule.npmViewVersion = _ => Promise.resolve({})
    npmClientModule.npmViewDistTags = _ => Promise.resolve([])

    // mock app settings
    testContext.showDependencyStatusesMock = false;
    Reflect.defineProperty(
      appSettings,
      "showDependencyStatuses", {
        get: () => testContext.showDependencyStatusesMock
      }
    )
  },


  "returns empty array when the document json is invalid": done => {
    let fixture = fixtureMap.read('package-invalid.json');

    let testDocument = {
      getText: range => fixture.content,
      uri: {
        fsPath: ''
      }
    };

    let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null);
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

    let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null);
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
      fileName: "filename.json",
      uri: {
        fsPath: ''
      }
    };

    let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null);
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

    // mock the api
    npmClientModule.npmViewVersion = viewVersionParam => {
      const [, packageName, maxSatisfyingVersion] = /(.*)@(.*)/.exec(viewVersionParam)
      return Promise.resolve(maxSatisfyingVersion)
    }

    npmClientModule.npmViewDistTags = packageName => {
      return Promise.resolve([
        { name: 'latest', version: '5.0.0' },
        { name: 'next', version: '2000.0.0' }
      ])
    }

    let codeLenses = testContext.testProvider.provideCodeLenses(testDocument, null);
    Promise.resolve(codeLenses)
      .then(collection => {
        assert.ok(collection instanceof Array, "codeLens should be an array.");
        assert.equal(collection.length, 8, `codeLens should be an array containing 8 items but instead was ${collection.length}`);

        assert.equal(
          collection[0].package.name,
          `dep1`,
          `dependency name should be dep1`
        );

        assert.equal(
          collection[2].package.name,
          `dep2`,
          `dependency name should be dep2`
        );

        assert.equal(
          collection[4].package.name,
          `dep3`,
          `dependency name should be dep3`
        );

        assert.equal(
          collection[6].package.name,
          `dep4`,
          `dependency name should be dep4`
        );

        done();
      })
      .catch(err => done(err));
  }

}
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { TestFixtureMap } from "../../../utils";
import editorSettings from 'presentation/editor/editorSettings';
import { PubCodeLensProvider } from "providers/pub/pubCodeLensProvider";
import * as PubAPIModule from "providers/pub/pubAPI";

const assert = require("assert");
const vscode = require("vscode");

const fixtureMap = new TestFixtureMap("./fixtures");

let testContext = null;

export default {
  beforeEach: () => {
    testContext = {};
    testContext.testProvider = new PubCodeLensProvider();

    // default api mocks
    PubAPIModule.pubGetPackageInfo = name => {
      return Promise.resolve({
        latestStableVersion: "3.2.1"
      });
    };

    Reflect.defineProperty(
      editorSettings,
      "showVersionLenses", {
      get: () => true
    }
    );

  },

  "returns empty array when the document text is empty": done => {
    let testDocument = {
      getText: range => "",
      uri: {
        fsPath: ""
      },
      fileName: "pubspec.yaml"
    };

    let codeLenses = testContext.testProvider.provideCodeLenses(
      testDocument,
      null
    );
    Promise.resolve(codeLenses)
      .then(collection => {
        assert.ok(
          collection instanceof Array,
          "codeLens should be an array."
        );
        assert.ok(
          collection.length === 0,
          "codeLens should be an empty array."
        );
        done();
      })
      .catch(err => done(err));
  },

  "returns empty array when the package has no dependencies": done => {
    let fixture = fixtureMap.read("pub/pubspec-no-deps.yaml");
    let testDocument = {
      getText: range => fixture.content,
      uri: {
        fsPath: ""
      },
      fileName: "pubspec.yaml"
    };

    let codeLenses = testContext.testProvider.provideCodeLenses(
      testDocument,
      null
    );
    Promise.resolve(codeLenses)
      .then(collection => {
        assert.ok(
          collection instanceof Array,
          "codeLens should be an array."
        );
        assert.ok(
          collection.length === 0,
          "codeLens should be an empty array."
        );
        done();
      })
      .catch(err => done(err));
  },

  "returns array of given dependencies to be resolved": done => {
    let fixture = fixtureMap.read("pub/pubspec-with-deps.yaml");

    let testDocument = {
      getText: range => fixture.content,
      uri: {
        fsPath: ""
      },
      positionAt: offset => new vscode.Position(0, 0),
      fileName: fixture.basename
    };

    let codeLenses = testContext.testProvider.provideCodeLenses(
      testDocument,
      null
    );
    Promise.resolve(codeLenses)
      .then(collection => {
        assert.ok(
          collection instanceof Array,
          "codeLens should be an array."
        );
        assert.equal(
          collection.length,
          7,
          "codeLens should be an array containing 5 items."
        );

        collection.forEach((entry, index) => {
          assert.equal(
            entry.package.name,
            `dep${index + 1}`,
            `dependency name should be dep${index + 1}.`
          );
        });

        done();
      })
      .catch(err => done(err));
  }


};

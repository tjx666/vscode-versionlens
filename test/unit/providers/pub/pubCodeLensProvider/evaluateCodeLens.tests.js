/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { PackageErrors } from 'providers/shared/definitions';
import { PackageCodeLens } from 'providers/shared/packageCodeLens';
import { PubCodeLensProvider } from "providers/pub/pubCodeLensProvider";
import * as PubAPIModule from "providers/pub/pubAPI";
import { generatePackage } from 'test/unit/utils.js';

const assert = require("assert");

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
  },

  "when code lens package version is 'latest' codeLens should return LatestCommand": () => {
    const codeLens = new PackageCodeLens(
      null,
      null,
      { name: "SomePackage", version: "latest", meta: {} },
      null
    );
    testContext.testProvider.evaluateCodeLens(codeLens, null);
    assert.equal(
      codeLens.command.title,
      "Latest",
      "Expected command.title failed."
    );
    assert.equal(codeLens.command.command, undefined);
    assert.equal(codeLens.command.arguments, undefined);
  },

  "when null info object returned from pub then codeLens should return ErrorCommand": done => {
    const codeLens = new PackageCodeLens(
      null,
      null,
      { name: "SomePackage", version: "1.2.3", meta: {} },
      null
    );

    PubAPIModule.pubGetPackageInfo = (name, localPath) => {
      return Promise.reject({
        status: 404,
        responseText: "Invalid object returned from server for 'SomePackage'"
      });
    };

    testContext.testProvider.evaluateCodeLens(codeLens, null).then(result => {
      assert.equal(
        result.command.title,
        "SomePackage could not be found",
        "Expected command.title failed."
      );
      assert.equal(result.command.command, undefined);
      assert.equal(result.command.arguments, undefined);
      done();
    });
  },

  "when valid info.latest object returned from pub then codeLens should return VersionCommand": done => {
    const codeLens = new PackageCodeLens(
      null,
      null,
      {
        name: "SomePackage",
        version: "1.2.3",
        meta: { tag: { name: "satisfies", isPrimaryTag: true } }
      },
      null
    );

    PubAPIModule.pubGetPackageInfo = name => {
      return Promise.resolve({
        latestStableVersion: "3.2.1"
      });
    };

    testContext.testProvider.evaluateCodeLens(codeLens, null).then(result => {
      assert.equal(result.command.title, "\u2191 3.2.1");
      assert.equal(
        result.command.command,
        "versionlens.updateDependencyCommand"
      );
      assert.equal(result.command.arguments[1], "3.2.1");
      done();
    });
  },

  "returns unexpected error command": () => {
    const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '1.2.3', { type: 'pub', error: PackageErrors.Unexpected, message: "" }), null);

    PubAPIModule.pubGetPackageInfo = name => {
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

};

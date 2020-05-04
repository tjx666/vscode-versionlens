/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { PackageCodeLens } from 'providers/shared/packageCodeLens';
import { PubCodeLensProvider } from "providers/pub/pubCodeLensProvider";
import * as PubAPIModule from "providers/pub/pubAPI";

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
        status: 500,
        responseText: "Invalid object returned from server for 'SomePackage'"
      });
    };

    testContext.testProvider.evaluateCodeLens(codeLens, null).then(result => {
      assert.equal(
        result.command.title,
        "An error occurred retrieving 'SomePackage' package",
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
  }

};

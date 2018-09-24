/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TestFixtureMap } from 'test/unit/utils';
import { removeAmbiguousTagNames } from 'common/versionUtils';

const fixtureMap = new TestFixtureMap('./fixtures');

const assert = require('assert');

export default {

  "reduces ambiguous tag names": () => {
    const expected = [
      "latest",
      "next",
      // "v4.6-next",
      "latest",
      "next",
      // "v3.x-latest",
      // "3.x-latest",
      // "3.x-next",
      // "v3.x-next",
      "latest",
      "next",
      "lts",
      "latest"
    ];

    const distTags = JSON.parse(fixtureMap.read('npm/npm.json').content).distTags;
    const results = removeAmbiguousTagNames.call(distTags);
    assert.equal(
      results.length,
      expected.length,
      `results.length to be expected.length`
    );

    results.forEach((testVersion, index) => {
      assert.equal(
        expected[index],
        testVersion.name,
        `${testVersion.name} to be ${expected[index]} at ${index}`
      );
    });

  },

  "preserves unambiguous tag names": () => {
    const expected = [
      "latest",
      "next",
      "beta",
      "legacy"
    ];

    const distTags = [
      { name: "latest", version: "4.6.1" },
      { name: "next", version: "4.6.1" },
      { name: "beta", version: "4.6.1" },
      { name: "legacy", version: "3.10.10" }
    ];

    const results = removeAmbiguousTagNames.call(distTags);
    assert.equal(
      results.length,
      expected.length,
      `results.length to be expected.length`
    );

  }

}
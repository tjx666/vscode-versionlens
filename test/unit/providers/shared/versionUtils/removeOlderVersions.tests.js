/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { removeOlderVersions } from 'providers/shared/versionUtils';

const assert = require('assert');

export default {

  "removes older versions": () => {
    const expected = [
      "5.0.0",
      "5.0.0-beta",
      "1.2.3"
    ];

    const tests = [
      "5.0.0",
      "5.0.0-beta",
      "1.2.3",
      "1.2.3-zebra",
      "1.2.3-rc",
      "1.2.3-beta",
      "1.2.3-alpha",
      "0.0.3"
    ].map(version => ({ version }));

    const testVersion = '1.2.3';
    const results = removeOlderVersions.call(tests, testVersion);
    assert.equal(
      results.length,
      expected.length,
      `results.length to be expected.length`
    );

    results.map(tag => tag.version)
      .forEach((testVersion, index) => {
        assert.equal(
          expected[index],
          testVersion,
          `${testVersion} to be ${expected[index]} at ${index}`
        );
      });

  },

  "removes older versions when using a ranged version": () => {
    const expected = [
      "1.4.0-next",
      "1.3.0-beta",
      "1.2.3",
    ];

    const tests = [
      "1.4.0-next",
      "1.3.0-beta",
      "1.2.3",
      "1.2.3-zebra",
      "1.2.3-rc",
      "1.2.3-beta",
      "1.2.3-alpha",
      "0.0.3"
    ].map(version => ({ version }));

    const testVersion = '^1.2.3';
    const results = removeOlderVersions.call(tests, testVersion);
    assert.equal(
      results.length,
      expected.length,
      `results.length to be expected.length`
    );

    results.map(tag => tag.version)
      .forEach((testVersion, index) => {
        assert.equal(
          expected[index],
          testVersion,
          `${testVersion} to be ${expected[index]} at ${index}`
        );
      });

  }

}
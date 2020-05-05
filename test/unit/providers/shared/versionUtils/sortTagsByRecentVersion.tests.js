/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { sortTagsByRecentVersion } from 'providers/shared/versionUtils';

const assert = require('assert');

export default {

  "returns expected order": () => {
    const expected = [
      "5.0.0",
      "1.2.3",
      "1.2.3-zebra",
      "1.2.3-rc",
      "1.2.3-beta",
      "1.2.3-alpha",
      "0.0.3"
    ];

    const results = [
      '1.2.3-zebra',
      '1.2.3-alpha',
      '1.2.3',
      '1.2.3-beta',
      '0.0.3',
      '1.2.3-rc',
      '5.0.0'
    ].map(version => ({ version }))
      .sort(sortTagsByRecentVersion);

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
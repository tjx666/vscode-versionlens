/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { parseVersionSpec, convertVersionSpecToString } from 'providers/dotnet/dotnetUtils.js';

const assert = require('assert');

export default {

  'converts basic nuget ranges to node ranges': () => {
    const expectedList = [
      // basic
      "1.0.0", "1.0.0",
      "(1.0.0,)", ">1.0.0",
      "[1.0.0]", "1.0.0",
      "(,1.0.0]", "<=1.0.0",
      "[1.0.0,2.0.0]", ">=1.0.0 <=2.0.0",
      "(1.0.0,2.0.0)", ">1.0.0 <2.0.0",
      "[1.0.0,2.0.0)", ">=1.0.0 <2.0.0"
    ];

    for (let i = 0; i < expectedList.length; i += 2) {
      const test = expectedList[i];
      const expected = expectedList[i + 1];
      const specTest = parseVersionSpec(test);
      const actual = convertVersionSpecToString(specTest);
      assert.equal(actual, expected, "nuget range did not convert to node range at " + i);
    }
  },

  'converts partial nuget ranges to node ranges': () => {
    const expectedList = [
      "1", "1.0.0",
      "1.0", "1.0.0",
      "[1,2]", ">=1.0.0 <=2.0.0",
      "(1,2)", ">1.0.0 <2.0.0",
    ];

    for (let i = 0; i < expectedList.length; i += 2) {
      const test = expectedList[i];
      const expected = expectedList[i + 1];
      const specTest = parseVersionSpec(test);
      const actual = convertVersionSpecToString(specTest);
      assert.equal(actual, expected, `nuget range did not convert ${expected} to ${actual} at ${i}`);
    }
  },

  'returns null for invalid ranges': () => {
    const results = [
      parseVersionSpec("1."),
      parseVersionSpec("1.0."),
      parseVersionSpec("s.2.0"),
      parseVersionSpec("beta"),
    ];

    results.forEach(x => {
      assert.ok(!x, "Should not parse range")
    })
  },

  'handles floating ranges': () => {
    const expectedList = [
      "1.*", ">=1.0.0 <2.0.0",
      "1.0.*", ">=1.0.0 <1.1.0"
    ];

    for (let i = 0; i < expectedList.length; i += 2) {
      const test = expectedList[i];
      const expected = expectedList[i + 1];
      const specTest = parseVersionSpec(test);
      const actual = convertVersionSpecToString(specTest);
      assert.equal(actual, expected, `nuget floating range did not convert ${expected} to ${actual} at ${i}`);
    }
  }

}
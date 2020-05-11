/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { filterTagsWithinRange } from 'core/common/helpers/versionHelpers';

const assert = require('assert');

const testDistTags = [
  {
    "name": "latest",
    "version": "4.6.1"
  },
  {
    "name": "next",
    "version": "4.6.1"
  },
  {
    "name": "legacy",
    "version": "2.1.0-legacy.1"
  },
  {
    "name": "legacy",
    "version": "2.1.0-legacy.2"
  },
  {
    "name": "legacy",
    "version": "2.1.0-legacy.3"
  },
  {
    "name": "tag",
    "version": "2.5.0-tag.1"
  },
  {
    "name": "tag",
    "version": "2.5.0-tag.2"
  }
];

export default {

  "returns empty when no matches found": () => {
    const results = filterTagsWithinRange("0.0.0", []);
    assert.equal(results.length, 0);
  },

  "returns versions within fixed range": () => {
    const results = filterTagsWithinRange("4.6.1", testDistTags);
    assert.equal(results.length, 2);
    assert.equal(results[0].name, "latest");
    assert.equal(results[1].name, "next");
  },

  "returns versions within min max range": () => {
    const expected = [
      '2.1.0-legacy.1',
      '2.1.0-legacy.2',
      '2.1.0-legacy.3',
    ]
    const results = filterTagsWithinRange(">=2.0.0 <=2.2.0", testDistTags);
    assert.equal(results.length, expected.length);
    expected.forEach((expectedValue, index) => {
      assert.equal(results[index].name, expectedValue.substr(6, 6));
      assert.equal(results[index].version, expectedValue);
    })
  },

  "returns versions within range": () => {
    const expected = [
      '2.5.0-tag.1',
      '2.5.0-tag.2',
    ]
    const results = filterTagsWithinRange("^2.4.9", testDistTags);
    assert.equal(results.length, expected.length);
    expected.forEach((expectedValue, index) => {
      assert.equal(results[index].name, expectedValue.substr(6, 3));
      assert.equal(results[index].version, expectedValue);
    })
  }

}
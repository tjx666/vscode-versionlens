import { filterVersionsWithinRange } from 'core/common/helpers/versionHelpers';

const assert = require('assert');

const testVersions = [
  '4.6.1',
  '4.6.2',
  '4.6.3',
  '4.6.4',
  '2.1.0-legacy.1',
  '2.1.0-legacy.2',
  '2.1.0-legacy.3',
  '2.5.0-tag.1',
  '2.5.0-tag.2',
];

export default {

  "returns empty when no matches found": () => {
    const results = filterVersionsWithinRange("0.0.0", testVersions);
    assert.equal(results.length, 0);
  },

  "returns versions within fixed range": () => {
    const results = filterVersionsWithinRange('4.6.4', testVersions);
    assert.equal(results.length, 1);
    assert.equal(results[0], '4.6.4');
  },

  "returns versions within min max range": () => {
    const expected = [
      '2.1.0-legacy.1',
      '2.1.0-legacy.2',
      '2.1.0-legacy.3',
    ]
    const results = filterVersionsWithinRange('>=2.0.0 <=2.2.0', testVersions);
    assert.equal(results.length, expected.length);
    expected.forEach((expectedValue, index) => {
      assert.equal(results[index], expectedValue);
    })
  },

  "returns versions within range": () => {
    const expected = [
      '2.5.0-tag.1',
      '2.5.0-tag.2',
    ]
    const results = filterVersionsWithinRange('^2.4.9', testVersions);
    assert.equal(results.length, expected.length);
    expected.forEach((expectedValue, index) => {
      assert.equal(results[index], expectedValue);
    })
  }

}
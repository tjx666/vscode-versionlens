/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { resolveVersionAgainstTags } from 'common/versionUtils';

const assert = require('assert');

export default {

  "returns tagged version when tag exists": () => {
    const testTags = [
      { name: 'latest', version: '1.2.3' },
      { name: 'next', version: '1.3.0-beta' }
    ];
    const testTagName = 'next';
    const testDefaultVersion = '1.2.3-should-not-return';
    const actualVersion = resolveVersionAgainstTags(testTags, testTagName, testDefaultVersion);

    assert.equal(actualVersion, testTags[1].version, "returned wrong version");
  },

  "returns default version when tag does not exist": () => {
    const testTags = [
      { name: 'latest', version: '1.2.3' },
      { name: 'next', version: '1.3.0-beta' }
    ];
    const testTagName = '4.6.8';
    const testDefaultVersion = '1.2.3';
    const actualVersion = resolveVersionAgainstTags(testTags, testTagName, testDefaultVersion);

    assert.equal(actualVersion, '1.2.3', "returned wrong version");
  }

}
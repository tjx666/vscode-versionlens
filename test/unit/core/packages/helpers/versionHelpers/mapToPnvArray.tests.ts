/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { mapToPnvArray } from 'core/common/helpers/versionHelpers';

const assert = require('assert');

const testDistTags = {
  "latest": "11.1.9",
  "next": "12.0.0-next.1",
  "v9-legacy": "9.5.12"
}

export default {

  "returns empty when no matches found": () => {
    const results = mapToPnvArray({});
    assert.equal(results.length, 0);
  },

  "returns mapped PackageNameVersion array": () => {
    const results = mapToPnvArray(testDistTags);
    assert.equal(results.length, 3);
    Object.keys(testDistTags).forEach((key, index) => {
      assert.equal(results[index].name, key);
      assert.equal(results[index].version, testDistTags[key]);
    })
  }

}
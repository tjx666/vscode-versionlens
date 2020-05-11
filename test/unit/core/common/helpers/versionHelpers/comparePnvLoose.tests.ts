/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { comparePnvLoose } from 'core/common/helpers/versionHelpers';

const assert = require('assert');

export default {

  "returns 1 when a is greater than b": () => {
    const a = { name: 'testa', version: '1.2.3' }
    const b = { name: 'testb', version: '1.2.1' }
    const result = comparePnvLoose(a, b);
    assert.equal(result, 1);
  },

  "returns -1 when a is less than b": () => {
    const a = { name: 'testa', version: '1.2.0' }
    const b = { name: 'testb', version: '1.2.5' }
    const result = comparePnvLoose(a, b);
    assert.equal(result, -1);
  },

  "returns 0 when a is equal to b": () => {
    const a = { name: 'testa', version: '1.2.0' }
    const b = { name: 'testb', version: '1.2.0' }
    const result = comparePnvLoose(a, b);
    assert.equal(result, 0);
  },

}
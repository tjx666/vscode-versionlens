/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { pubPackageParser } from './../../../../src/providers/pub/pubPackageParser';

const assert = require('assert');

let testContext = null

export const PubPackageParserTests = {

  'pubPackageParser': {

    beforeAll: () => {
      testContext = {}
    },

    beforeEach: () => {
      testContext.appContribMock = {}
    },

    'returns the expected object for semver versions': () => {
      let name = 'flutter_bloc';
      let version = '0.10.1';

      let result = pubPackageParser(name, version, testContext.appContribMock);
      assert.equal(result.name, 'flutter_bloc', "Expected packageName");
      assert.equal(result.version, '0.10.1', "Expected packageName");
      assert.equal(result.meta.type, 'pub', "Expected meta.type");
      assert.ok(!result.meta.tag.isInvalid, "Expected meta.tag.isInvalid");
    },

  }

}
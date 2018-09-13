/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { mavenGetPackageVersions } from 'providers/maven/mavenAPI.js';

const assert = require('assert');

export const MavenAPITests = {

  'mavenGetPackageVersionsSpec': {

    'Able to get versions from maven central': () => {
      let junitVersions = mavenGetPackageVersions('junit:junit')
      assert.notEqual(junitVersions.length, 0)
    },

  }

}
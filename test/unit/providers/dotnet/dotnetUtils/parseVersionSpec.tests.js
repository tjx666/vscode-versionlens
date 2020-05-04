/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { parseVersionSpec } from 'providers/dotnet/dotnetUtils.js';

const assert = require('assert');

export default {

  'No nulls from valid notations': () => {
    // spec https://docs.microsoft.com/en-us/nuget/create-packages/dependency-versions#version-ranges
    const results = [
      parseVersionSpec("1.0.0"),
      parseVersionSpec("(1.0.0,)"),
      parseVersionSpec("[1.0.0]"),
      parseVersionSpec("(,1.0.0]"),
      parseVersionSpec("(,1.0.0)"),
      parseVersionSpec("[1.0.0,2.0.0]"),
      parseVersionSpec("(1.0.0,2.0.0)"),
      parseVersionSpec("[1.0.0,2.0.0)"),
      parseVersionSpec("(1.0.0)")   // should be null though
    ];

    results.forEach(x => {
      assert.ok(!!x, "Could not parse range")
    })
  },

  'returns nulls from invalid notations': () => {
    const results = [
      parseVersionSpec("1."),
      parseVersionSpec("1.0."),
      parseVersionSpec("s.2.0"),
      parseVersionSpec("beta")
    ];

    results.forEach(x => {
      assert.ok(!x, "Could not parse range")
    })
  }


}
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import parseVersionSpec from './utils/parseVersionSpec.tests.js';
import convertNugetToNodeRange from './utils/convertNugetToNodeRange.tests.js';

export const DotNetUtils = {
  parseVersionSpec,
  convertNugetToNodeRange
}
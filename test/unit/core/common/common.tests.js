/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import filterVersionsWithinRange from './helpers/versionHelpers/filterVersionsWithinRange.tests';
import filterTagsWithinRange from './helpers/versionHelpers/filterTagsWithinRange.tests';
import mapToPnvArray from './helpers/versionHelpers/mapToPnvArray.tests';
import comparePnvLoose from './helpers/versionHelpers/comparePnvLoose.tests';
import extractTaggedVersions from './helpers/versionHelpers/extractTaggedVersions.tests';
import splitReleasesFromArray from './helpers/versionHelpers/splitReleasesFromArray.tests';
import removeFourSegmentVersionsFromArray from './helpers/versionHelpers/removeFourSegmentVersionsFromArray.tests';


export const VersionHelperTests = {
  filterVersionsWithinRange,
  filterTagsWithinRange,
  mapToPnvArray,
  comparePnvLoose,
  extractTaggedVersions,
  splitReleasesFromArray,
  removeFourSegmentVersionsFromArray,
}
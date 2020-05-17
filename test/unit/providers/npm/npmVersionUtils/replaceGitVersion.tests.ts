import * as NpmVersionUtils from 'providers/npm/npmVersionUtils'
import { PackageResponse, PackageSourceTypes } from '/core/packages'

const assert = require('assert')

export default {

  "replaceGitVersion": {

    "handles #tag|commit|semver:": () => {
      const packageInfo: PackageResponse = {
        providerName: 'testreplace',
        source: PackageSourceTypes.Github,
        requested: {
          path: 'packagepath',
          name: 'packagename',
          version: 'github:someRepo/someProject#semver:^2',
        },
        resolved: {
          name: 'packagename',
          version: '^2'
        }
      }

      const expected = 'github:someRepo/someProject#semver:4.2.1'

      // NpmVersionUtils
      const actual = NpmVersionUtils.npmReplaceVersion(
        packageInfo,
        '4.2.1'
      )

      assert.equal(actual, expected)
    },

  }

}
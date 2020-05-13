import { customNpmGenerateVersion } from 'providers/npm/npmPackageResolver.js';
import * as npmClientModule from 'providers/npm/npmClient.js';

const assert = require('assert');
const mock = require('mock-require');

let testContext = {}

export default {

  // reset all require mocks
  afterAll: () => mock.stopAll,

  beforeAll: () => {
    testContext = {}

    // default config mock
    testContext.githubTaggedCommitsMock = ['Commit', 'Release', 'Tag']

    // default api mock
    npmClientModule.npmViewVersion = _ => Promise.resolve(null)
    npmClientModule.npmViewDistTags = packageName => {
      return Promise.resolve([
        { name: 'latest', version: '5.0.0' },
      ])
    }
  },

  beforeEach: () => {
    testContext.appContribMock = {}
    Reflect.defineProperty(
      testContext.appContribMock,
      "githubTaggedCommits", {
        get: () => testContext.githubTaggedCommitsMock
      }
    )
  },

  'customGenerateVersion preserves leading range symbol for github semver tags': () => {
    let packageMock = {
      name: 'bootstrap',
      version: 'twbs/bootstrap#^4.0.0-alpha.4',
      meta: {
        type: 'github',
        commitish: '^4.0.0-alpha.4',
        userRepo: 'twbs/bootstrap'
      }
    };

    const newVersion = '4.0.0-alpha.5';
    assert.equal(
      customNpmGenerateVersion(packageMock, newVersion), `twbs/bootstrap#^4.0.0-alpha.5`,
      "Expected customGenerateVersion to return correct version"
    );
  },

  'customGenerateVersion ignores leading range symbol for github commit sha': () => {
    let packageMock = {
      name: 'bootstrap',
      version: 'twbs/bootstrap#^4.0.0-alpha.4',
      meta: {
        type: 'github',
        commitish: '^4.0.0-alpha.4',
        userRepo: 'twbs/bootstrap'
      }
    };

    const newVersion = '5f7a3bc';
    assert.equal(
      customNpmGenerateVersion(packageMock, newVersion), `twbs/bootstrap#5f7a3bc`,
      "Expected customGenerateVersion to return correct version"
    );
  }


}
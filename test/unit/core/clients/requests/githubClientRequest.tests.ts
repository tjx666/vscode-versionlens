import { TestFixtureMap } from 'test/unit/utils'
import { GithubRequest } from 'core/clients'

const assert = require('assert')
const mock = require('mock-require')
const fixtureMap = new TestFixtureMap('./fixtures')

let requestLightMock = null
let testContext = null

export const GithubRequestTests = {

  beforeAll: () => {
    testContext = {}
    // mock require modules
    requestLightMock = {}
    mock('request-light', requestLightMock)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    testContext.rut = new GithubRequest();
    requestLightMock.xhr = _ => { throw new Error("Not implemented") }
  },

  "httpGet(userRepo, category)": {

    "generates the expected url with no query params": async () => {
      requestLightMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/testCategory', "Expected httpRequest.xhr(options.url) but failed.");
        assert.equal(options.type, 'GET');
        assert.equal(options.headers['user-agent'], 'vscode-contrib/vscode-versionlens');
        return Promise.resolve({
          status: 200,
          responseText: null
        })
      };

      await testContext.rut.httpGet('testRepo', 'testCategory')

    },

  },

  "getLatestCommit(userRepo)": {

    "generates expected commits url": async () => {
      requestLightMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/commits?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-commit.json').content
        })
      };

      await testContext.rut.getLatestCommit('testRepo')
    },

    "returns a reduced commit object data from result": async () => {
      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-commit.json').content
        })
      };

      await testContext.rut.getLatestCommit('testRepo')
        .then(entry => {
          assert.equal(entry.category, 'commit', "Expected category to match");
          assert.equal(entry.version, '0913a0b', "Expected sha to match");
        })
    },

    "generates expected tags url": async () => {
      requestLightMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/tags?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-tag.json').content
        })
      };

      testContext.rut.getCommitBySha = (sha) => {
        return Promise.resolve({
          category: null,
          version: null
        });
      }

      await testContext.rut.getLatestTag('testRepo')
    },

    "returns a reduced tag object data from result": async () => {
      requestLightMock.xhr = options => {
        let resultPromise;
        if (options.url.includes('tags'))
          resultPromise = Promise.resolve({
            status: 200,
            responseText: fixtureMap.read('common/github-tag.json').content
          })
        else
          resultPromise = Promise.resolve({
            status: 200,
            responseText: fixtureMap.read('common/github-commit-by-sha.json').content
          })

        return resultPromise
      };

      const rut = new GithubRequest();
      await rut.getLatestTag('testRepo')
        .then(entry => {
          assert.equal(entry.category, 'tag', "Expected category to match");
          assert.equal(entry.version, 'v4.0.0-alpha.5', "Expected tag to match");
        })
    },

  },

  "getLatestRelease(userRepo)": {

    "generates the expected url with pagination": async () => {
      requestLightMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/releases?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-release.json').content
        })
      };

      await testContext.rut.getLatestRelease('testRepo')
    },

    'returns a reduced release object data from result': async () => {
      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-release.json').content
        })
      };

      await testContext.rut.getLatestRelease('testRepo')
        .then(entry => {
          assert.equal(entry.category, 'release', "Expected category to match");
          assert.equal(entry.version, 'v4.0.0-alpha.5', "Expected sha to match");
        })
    }

  },

  // "getLatestPreRelease(userRepo)": {
  //   only: true,
  //   "generates the expected url with no pagination": done => {
  //     requestLightMock.xhr = options => {
  //       assert.equal(options.url, 'https://api.github.com/repos/testRepo/releases/latest', "Expected httpRequest.xhr(options.url) but failed.");
  //       done();
  //       return Promise.resolve({
  //         status: 200,
  //         responseText: null
  //       });
  //     };
  //     testContext.rut.getLatestRelease('testRepo', false)
  //       .catch(err => done(err));
  //   }

  // }

};
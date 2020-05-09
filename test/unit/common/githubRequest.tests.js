/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TestFixtureMap } from 'test/unit/utils'
import { githubRequest } from 'common/githubRequest'
import appContribMock from '/appContrib'

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
    requestLightMock.xhr = _ => { throw new Error("Not implemented") }
  },

  "httpGet(userRepo, category)": {

    "generates the expected url with no query params": done => {
      requestLightMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/testCategory', "Expected httpRequest.xhr(options.url) but failed.");
        assert.equal(options.type, 'GET');
        assert.equal(options.headers['user-agent'], 'vscode-contrib/vscode-versionlens');
        done();
        return Promise.resolve({
          status: 200,
          responseText: null
        })
      };

      githubRequest.httpGet('testRepo', 'testCategory')
        .catch(err => done(err));
    },

    "caches url response when promise resolves": done => {
      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: '{"message": "cached test"}'
        })
      };

      githubRequest.httpGet('testRepo', 'testCategory')
        .then(response => {
          const cachedData = githubRequest.cache.get('GET_https://api.github.com/repos/testRepo/testCategory');
          assert.equal(
            cachedData.message,
            'cached test',
            "Expected url cache to contain correct data"
          );
          done();
        })
        .catch(err => done(err));
    },

    "caches url response when promise is rejected": done => {
      requestLightMock.xhr = options => {
        return Promise.reject({
          status: 404,
          responseText: '{"message": "Not Found"}'
        })
      };

      githubRequest.httpGet('testRepo', 'testCategory')
        .then(results => done(new Error("Should not be called")))
        .catch(response => {
          const cachedData = githubRequest.cache.get('GET_https://api.github.com/repos/testRepo/testCategory');
          assert.equal(
            cachedData.message,
            'Not Found',
            "Expected url cache to contain correct data"
          );
          done();
        });
    }

  },

  "getLatestCommit(userRepo)": {

    "generates expected commits url": done => {
      requestLightMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/commits?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        done();
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-commit.json').content
        })
      };

      githubRequest.getLatestCommit('testRepo')
        .catch(err => done(err));
    },

    "returns a reduced commit object data from result": done => {
      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-commit.json').content
        })
      };

      githubRequest.getLatestCommit('testRepo')
        .then(entry => {
          assert.equal(entry.category, 'commit', "Expected category to match");
          assert.equal(entry.version, '0913a0b', "Expected sha to match");
          done();
        })
        .catch(err => done(err));
    },

    "generates expected tags url": done => {
      requestLightMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/tags?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        done();
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-tag.json').content
        })
      };
      githubRequest.getCommitBySha = sha => {
        return Promise.resolve({
          category: null,
          version: null
        });
      }
      githubRequest.getLatestTag('testRepo')
        .catch(err => done(err));
    },

    "returns a reduced tag object data from result": done => {
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

      githubRequest.getLatestTag('testRepo')
        .then(entry => {
          assert.equal(entry.category, 'tag', "Expected category to match");
          assert.equal(entry.version, 'v4.0.0-alpha.5', "Expected tag to match");
          done();
        })
        .catch(err => done(err));
    },

  },

  "getLatestRelease(userRepo)": {

    "generates the expected url with pagination": done => {
      requestLightMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/releases?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        done();
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-release.json').content
        })
      };
      githubRequest.getLatestRelease('testRepo')
        .catch(err => done(err));
    },

    'returns a reduced release object data from result': done => {
      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-release.json').content
        })
      };
      githubRequest.getLatestRelease('testRepo')
        .then(entry => {
          assert.equal(entry.category, 'release', "Expected category to match");
          assert.equal(entry.version, 'v4.0.0-alpha.5', "Expected sha to match");
          done();
        })
        .catch(err => done(err));
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
  //     githubRequest.getLatestRelease('testRepo', false)
  //       .catch(err => done(err));
  //   }

  // }

};
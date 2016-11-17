/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import * as path from 'path';
import { GithubRequest } from '../../../src/common/githubRequest';
import { TestFixtureMap } from '../../testUtils';
import { register, clear } from '../../../src/common/di';

describe('GithubRequest', () => {
  const testPath = path.join(__dirname, '../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  let testGithubRequest;
  const httpRequestMock = {};
  const appConfigMock;

  beforeEach(() => {
    clear();
    register('httpRequest', httpRequestMock);
    register('appConfig', appConfigMock);

    // mock the config
    testGithubRequest = new GithubRequest();
  });

  describe('.request(userRepo, category, paginated)', () => {

    it('generates the expected url with no pagination', done => {
      httpRequestMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/testCategory', "Expected httpRequest.xhr(options.url) but failed.");
        done();
        return Promise.resolve({
          status: 200,
          responseText: null
        })
      };
      testGithubRequest.doRequest('testRepo', 'testCategory', false)
        .catch(console.error.bind(console));
    });

    it('generates the expected url with pagination', done => {
      httpRequestMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/testCategory?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        done();
        return Promise.resolve({
          status: 200,
          responseText: null
        })
      };
      testGithubRequest.doRequest('testRepo', 'testCategory', true)
        .catch(console.error.bind(console));
    });

    it('caches url response when 200', done => {
      httpRequestMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: '{"message": "cached test"}'
        })
      };

      testGithubRequest.doRequest('testRepo', 'testCategory', false)
        .then(response => {
          const cachedData = testGithubRequest.cache.get('https://api.github.com/repos/testRepo/testCategory');
          assert.equal(
            cachedData.message,
            'cached test',
            "Expected url cache to contain correct data"
          );
          done();
        })
        .catch(console.error.bind(console));
    });

  });

  describe('.getLatestCommit(userRepo)', () => {

    it('generates expected commits url', done => {
      httpRequestMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/commits?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        done();
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-commit.json').content
        })
      };

      testGithubRequest.getLatestCommit('testRepo')
        .catch(console.error.bind(console));
    });

    it('returns a reduced commit object data from result', done => {
      httpRequestMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-commit.json').content
        })
      };

      testGithubRequest.getLatestCommit('testRepo')
        .then(entry => {
          assert.equal(entry.category, 'commit', "Expected category to match");
          assert.equal(entry.version, '0913a0b', "Expected sha to match");
          done();
        })
        .catch(console.error.bind(console));
    });

  });

  describe('.getLatestTag(userRepo)', () => {

    it('generates expected tags url', done => {
      httpRequestMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/tags?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        done();
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-tag.json').content
        })
      };
      testGithubRequest.getCommitBySha = sha => {
        return Promise.resolve({
          category: null,
          version: null
        });
      }
      testGithubRequest.getLatestTag('testRepo')
        .catch(console.error.bind(console));
    });

    it('returns a reduced tag object data from result', done => {
      let xhrCallCount = 0;
      httpRequestMock.xhr = options => {
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

      testGithubRequest.getLatestTag('testRepo')
        .then(entry => {
          assert.equal(entry.category, 'tag', "Expected category to match");
          assert.equal(entry.version, 'v4.0.0-alpha.5', "Expected tag to match");
          done();
        })
        .catch(console.error.bind(console));
    });

  });

  describe('.getLatestRelease(userRepo, incPreReleases)', () => {

    it('generates the expected url with no pagination', done => {
      httpRequestMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/releases/latest', "Expected httpRequest.xhr(options.url) but failed.");
        done();
        return Promise.resolve({
          status: 200,
          responseText: null
        });
      };
      testGithubRequest.getLatestRelease('testRepo', false)
        .catch(console.error.bind(console));
    });

    it('generates the expected url with pagination', done => {
      httpRequestMock.xhr = options => {
        assert.equal(options.url, 'https://api.github.com/repos/testRepo/releases?page=1&per_page=1', "Expected httpRequest.xhr(options.url) but failed.");
        done();
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-release.json').content
        })
      };
      testGithubRequest.getLatestRelease('testRepo', true)
        .catch(console.error.bind(console));
    });

    it('returns a reduced release object data from result', done => {
      let xhrCallCount = 0;
      httpRequestMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: fixtureMap.read('common/github-release.json').content
        })
      };
      testGithubRequest.getLatestRelease('testRepo')
        .then(entry => {
          assert.equal(entry.category, 'release', "Expected category to match");
          assert.equal(entry.version, 'v4.0.0-alpha.5', "Expected sha to match");
          done();
        })
        .catch(console.error.bind(console));
    });

  });

});
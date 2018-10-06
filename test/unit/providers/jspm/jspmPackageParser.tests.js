/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { jspmPackageParser, customJspmGenerateVersion } from 'providers/jspm/jspmPackageParser';
import * as npmClientModule from 'providers/npm/npmClient.js';

const assert = require('assert');

let testContext = null;

export const JSPMPackageParser = {

  beforeAll: () => {
    testContext = {}
    testContext.githubTaggedCommitsMock = ['Commit', 'Release', 'Tag'];
  },

  beforeEach: () => {
    testContext.appContribMock = {}
    Reflect.defineProperty(
      testContext.appContribMock,
      "githubTaggedCommits", {
        get: () => testContext.githubTaggedCommitsMock
      }
    )

    // default api mocks
    npmClientModule.npmViewDistTags = _ => {
      return Promise.resolve([
        { name: 'latest', version: '1.2.3' },
        { name: 'alpha', version: '1.2.5-alpha.1' },
        { name: 'beta', version: '1.2.5-beta.1' }
      ]);
    }
  },

  'jspmPackageParser': {

    'returns the expected object for npm semver versions': done => {
      const packagePath = '.';
      const name = 'bluebird';
      const version = 'npm:bluebird@3.4.6';

      const parsedResults = jspmPackageParser(packagePath, name, version, testContext.appContribMock);
      Promise.resolve(parsedResults)
        .then(results => {
          assert.equal(results[0].name, 'bluebird', "Expected packageName");
          assert.equal(results[0].version, '3.4.6', "Expected packageName");
          assert.equal(results[0].meta.type, 'npm', "Expected meta.type");
          assert.ok(!results[0].meta.tagisInvalid, "Expected meta.tag.isInvalid");
          assert.ok(!!results[0].customGenerateVersion, "Expected customGenerateVersion");
          done();
        })
        .catch(err => done(err));
    },

    'returns the expected object for github versions': done => {
      const packagePath = '.';
      const name = 'bootstrap';
      const version = 'github:twbs/bootstrap@4.0.0-alpha.4';

      const parsedResults = jspmPackageParser(packagePath, name, version, testContext.appContribMock);
      Promise.resolve(parsedResults)
        .then(results => {
          results.forEach((result, index) => {
            assert.equal(result.name, 'twbs/bootstrap', "Expected packageName");
            assert.equal(result.version, 'twbs/bootstrap#4.0.0-alpha.4', "Expected packageName");
            assert.equal(result.meta.category, testContext.githubTaggedCommitsMock[index], `Expected meta.category ${result.meta.category} == ${testContext.githubTaggedCommitsMock[index]}`);
            assert.equal(result.meta.type, 'github', "Expected meta.type");
            assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
            assert.equal(result.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
            assert.equal(result.meta.commitish, '4.0.0-alpha.4', "Expected meta.commitish");
            assert.ok(!!result.customGenerateVersion, "Expected package.customGenerateVersion");
          });
          done();
        })
        .catch(err => done(err));
    },

    'customGenerateVersion preserves leading symbol for github semver tags': () => {
      let packageMock = {
        name: 'bootstrap',
        value: 'github:twbs/bootstrap@^4.0.0-alpha.4',
        meta: {
          type: 'github',
          commitish: '^4.0.0-alpha.4'
        }
      };

      const newVersion = '4.0.0-alpha.5';
      assert.equal(
        customJspmGenerateVersion(packageMock, newVersion), `github:bootstrap@^4.0.0-alpha.5`,
        "Expected customGenerateVersion to return correct version"
      );
    },

    'customGenerateVersion ignores leading symbol for github commit sha': () => {
      let packageMock = {
        name: 'bootstrap',
        version: 'github:twbs/bootstrap@^4.0.0-alpha.4',
        meta: {
          type: 'github',
          commitish: '^4.0.0-alpha.4'
        }
      };

      const newVersion = '5f7a3bc';
      assert.equal(
        customJspmGenerateVersion(packageMock, newVersion), `github:bootstrap@5f7a3bc`,
        "Expected customGenerateVersion to return correct version"
      );
    }

  }

}
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TestFixtureMap } from 'test/unit/utils';
import { npmPackageParser, customNpmGenerateVersion } from 'providers/npm/npmPackageParser';
import * as npmAPIModule from 'providers/npm/npmAPI';

const mock = require('mock-require');
const assert = require('assert');
const vscode = require('vscode');

const fixtureMap = new TestFixtureMap('./fixtures');

export const NPMPackageParserTests = {

  beforeAll: () => {
    // default config mock
    this.githubTaggedCommitsMock = ['Commit', 'Release', 'Tag']

    // default api mock
    npmAPIModule.npmViewVersion = _ => Promise.resolve(null)
    npmAPIModule.npmViewDistTags = packageName => {
      return Promise.resolve([
        { name: 'latest', version: '5.0.0' },
      ])
    }
  },

  beforeEach: () => {
    this.appContribMock = {}
    Reflect.defineProperty(
      this.appContribMock,
      "githubTaggedCommits", {
        get: () => this.githubTaggedCommitsMock
      }
    )
  },

  'npmPackageParser': {

    'returns the expected object for non ranged semver versions': done => {
      const name = 'bootstrap';
      const version = '1.2.3';

      const parsedResults = npmPackageParser(name, version, this.appContribMock);
      Promise.resolve(parsedResults)
        .then(results => {
          assert.equal(results[0].name, 'bootstrap', "Expected packageName");
          assert.equal(results[0].version, '1.2.3', "Expected packageVersion");
          assert.equal(results[0].meta.type, 'npm', "Expected meta.type");
          assert.ok(!results[0].meta.tag.isInvalid, "Expected meta.tag.isInvalid");
          assert.ok(results[0].meta.tag.isFixedVersion, "Expected meta.tag.isFixedVersion to be true");
          assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
          done();
        })
        .catch(console.log.bind(this));
    },

    'returns the expected object for ranged semver versions': done => {
      const name = 'bootstrap';
      const version = '~1.2.3';

      // mock the api
      npmAPIModule.npmViewVersion = _ => Promise.resolve("1.2.3")

      const parsedResults = npmPackageParser(name, version, this.appContribMock);
      Promise.resolve(parsedResults)
        .then(results => {
          assert.equal(results[0].name, 'bootstrap', "Expected packageName");
          assert.equal(results[0].version, '~1.2.3', "Expected packageVersion");
          assert.equal(results[0].meta.type, 'npm', "Expected meta.type");
          assert.ok(!results[0].meta.tag.isInvalid, "Expected meta.tag.isInvalid");
          assert.ok(!results[0].meta.tag.isFixedVersion, "Expected meta.tag.isFixedVersion to be false");
          assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
          done();
        })
        .catch(console.log.bind(this));
    },

    'returns the expected object for file versions': done => {
      const name = 'another-project';
      const version = 'file:../another-project';

      const parsedResults = npmPackageParser(name, version, this.appContribMock);
      Promise.resolve(parsedResults)
        .then(result => {
          assert.equal(result.name, 'another-project', "Expected packageName");
          assert.equal(result.version, 'file:../another-project', "Expected packageName");
          assert.equal(result.meta.type, 'file', "Expected meta.type");
          assert.equal(result.meta.remoteUrl, '../another-project', "Expected meta.remoteUrl");
          assert.equal(result.customGenerateVersion, null, "Expected customGenerateVersion");
          done();
        })
        .catch(console.log.bind(this));
    },

    'returns the expected object for github versions': done => {
      const name = 'bootstrap';
      const version = 'twbs/bootstrap#v10.2.3-alpha';

      const parsedResults = npmPackageParser(name, version, this.appContribMock);
      Promise.resolve(parsedResults)
        .then(results => {
          results.forEach((result, index) => {
            assert.equal(result.name, 'bootstrap', "Expected packageName");
            assert.equal(result.version, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
            assert.equal(result.meta.category, this.githubTaggedCommitsMock[index], `Expected meta.category ${result.meta.category} == ${this.githubTaggedCommitsMock[index]}`);
            assert.equal(result.meta.type, 'github', "Expected meta.type");
            assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
            assert.equal(result.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
            assert.equal(result.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
            assert.ok(!!result.customGenerateVersion, "Expected package.customGenerateVersion");
          });
          done();
        })
        .catch(console.log.bind(this));
    },

    'returns the expected object for git+http+github versions': done => {
      const name = 'bootstrap';
      const version = 'git+https://git@github.com/twbs/bootstrap.git#v10.2.3-alpha';

      const parsedResults = npmPackageParser(name, version, this.appContribMock);
      Promise.resolve(parsedResults)
        .then(results => {
          results.forEach((result, index) => {
            assert.equal(result.name, 'bootstrap', "Expected packageName");
            assert.equal(result.version, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
            assert.equal(result.meta.category, this.githubTaggedCommitsMock[index], `Expected meta.category ${result.meta.category} == ${this.githubTaggedCommitsMock[index]}`);
            assert.equal(result.meta.type, 'github', "Expected meta.type");
            assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
            assert.equal(result.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
            assert.equal(result.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
            assert.ok(!!result.customGenerateVersion, "Expected package.customGenerateVersion");
          });
          done();
        })
        .catch(console.log.bind(this));
    }

  },

  'customGenerateVersion': {

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

}
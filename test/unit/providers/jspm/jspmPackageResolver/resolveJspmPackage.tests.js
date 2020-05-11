import { TestFixtureMap } from 'test/unit/utils';
import { resolveJspmPackage, customJspmGenerateVersion } from 'presentation/providers/jspm/jspmPackageResolver';

const jspmFixtures = new TestFixtureMap('./unit/providers/jspm/fixtures');

const assert = require('assert');
const mock = require('mock-require');
let pacoteMock = null
let testContext = null;

export default {

  beforeAll: () => {
    testContext = {}
    testContext.githubTaggedCommitsMock = ['Commit', 'Release', 'Tag'];
    pacoteMock = {
      packument: {}
    }
    mock('pacote', pacoteMock)
  },

  beforeEach: () => {
    // mock defaults
    pacoteMock.packument = (npaResult, opts) => { }

    testContext.appContribMock = {}
    Reflect.defineProperty(
      testContext.appContribMock,
      "githubTaggedCommits", {
      get: () => testContext.githubTaggedCommitsMock
    }
    )
  },

  'returns the expected object for npm semver versions': done => {
    const packagePath = '.';
    const name = 'bluebird';
    const version = 'npm:bluebird@3.4.6';

    pacoteMock.packument = (npaResult, opts) => Promise.resolve(jspmFixtures.readJSON('./pacote.json').expectedSemverVersion)

    const parsedResults = resolveJspmPackage(packagePath, name, version, testContext.appContribMock);
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

    pacoteMock.packument = (npaResult, opts) => Promise.resolve(jspmFixtures.readJSON('./pacote.json').expectedGithubVersion)

    const parsedResults = resolveJspmPackage(packagePath, name, version, testContext.appContribMock);
    Promise.resolve(parsedResults)
      .then(results => {
        results.forEach((result, index) => {
          assert.equal(result.name, 'bootstrap', "Expected packageName");
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
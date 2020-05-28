import { testPath, LoggerMock } from 'infrastructure.testing';

import { VersionLensExtension } from 'presentation.extension';

import { NpmConfig, PacoteClient } from 'infrastructure.providers/npm'
import Fixtures from './pacoteClient.fixtures'

const assert = require('assert')
const path = require('path')
const mock = require('mock-require')
const npa = require('npm-package-arg');
const fs = require('fs');

let pacoteMock = null
let defaultExtensionMock: VersionLensExtension;

export default {

  beforeAll: () => {
    pacoteMock = {
      packument: {}
    }

    mock('pacote', pacoteMock)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    // mock defaults
    pacoteMock.packument = (npaResult, opts) => { }

    defaultExtensionMock = new VersionLensExtension(
      {
        get: (k) => null,
        defrost: () => null
      },
      null
    );
  },

  'fetchPackage': {

    'uses npmrc registry': async () => {
      const packagePath = path.join(
        testPath,
        './src/infrastructure.providers/npm/test/fixtures/config'
      );

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        source: 'npmtest',
        package: {
          path: packagePath,
          name: 'aliased',
          version: 'npm:pacote@11.1.9',
        },
      }

      // write the npmrc file
      const npmrcPath = packagePath + '/.npmrc';
      fs.writeFileSync(npmrcPath, Fixtures[".npmrc"])
      assert.ok(require('fs').existsSync(testRequest.package.path), 'test .npmrc doesnt exist?')

      // setup initial call
      pacoteMock.packument = async (npaResult, opts) => {
        assert.equal(opts.cwd, testRequest.package.path)
        assert.equal(opts['//registry.npmjs.example/:_authToken'], '12345678')
        return Fixtures.packumentGit
      }

      const cut = new PacoteClient(
        new NpmConfig(defaultExtensionMock),
        new LoggerMock()
      );

      const npaSpec = npa.resolve(
        testRequest.package.name,
        testRequest.package.version,
        testRequest.package.path
      );

      return cut.fetchPackage(testRequest, npaSpec)
        .then(_ => {
          // delete the npmrc file
          fs.unlinkSync(npmrcPath)
        });
    },

  }

}
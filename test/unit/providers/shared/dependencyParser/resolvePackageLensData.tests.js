/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { resolvePackageLensData } from 'providers/shared/dependencyParser';

const assert = require('assert');

export default {

  'passes arguments to customVersionParser when specified': done => {
    const dependencyNodes = [{
      packageInfo: {
        name: 'test',
        version: '1.2.3'
      }
    }];
    const appContrib = {};
    let funcCalled = false;

    const packageLensResolvers = resolvePackageLensData(
      dependencyNodes, appContrib,
      (testName, testVersion, testConfig) => {
        funcCalled = true;
        assert.ok(testName === dependencyNodes[0].packageInfo.name, 'customVersionParser: testName does not match');
        assert.ok(testVersion === dependencyNodes[0].packageInfo.version, 'customVersionParser: testVersion does not match');
        assert.ok(testConfig === appContrib, 'customVersionParser: appContrib does not match');
        return Promise.resolve({
          name: testName,
          version: testVersion
        });
      }
    );

    assert.ok(funcCalled, 'customVersionParser: was not called');

    // check that the result of the customParser is returned in a promise
    Promise.all(packageLensResolvers)
      .then(results => {
        assert.ok(results[0][0].node === dependencyNodes[0], 'customVersionParser: node does not match');
        done();
      })
      .catch(err => done(err));

  },

  'returns a collection of nodes wrapped in promises when no customVersionParser is specified': done => {
    const dependencyNodes = [{}, {}, {}];
    const appContrib = {};
    const packageLensResolvers = resolvePackageLensData(
      dependencyNodes,
      appContrib
    );

    Promise.all(packageLensResolvers)
      .then(results => {
        assert.ok(results[0].node === dependencyNodes[0], 'resolvePackageLensData: node does not match');
        assert.ok(results[1].node === dependencyNodes[1], 'resolvePackageLensData: node does not match');
        assert.ok(results[2].node === dependencyNodes[2], 'resolvePackageLensData: node does not match');
        done();
      })
      .catch(err => done(err));
  }

}
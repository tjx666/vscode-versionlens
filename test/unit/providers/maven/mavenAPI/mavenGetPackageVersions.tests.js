import { mavenGetPackageVersions } from 'providers/maven/mavenAPI.js';

const assert = require('assert');

export default {

  'Able to get versions from maven central': () => {
    let junitVersions = mavenGetPackageVersions('junit:junit')
    assert.notEqual(junitVersions.length, 0)
  },

}
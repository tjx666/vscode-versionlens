import * as Tests from './all.tests'

const tty = require('tty');
const Mocha = require("mocha");

require('mocha-ui-esm');

// Linux: prevent a weird NPE when mocha on Linux requires the window size from the TTY
// Since we are not running in a tty environment, we just implementt he method statically
if (!tty.getWindowSize) tty.getWindowSize = function () { return [80, 75]; };

const runner = new Mocha({
  ui: 'esm',
  reporter: 'spec',
  timeout: 60000,
});

// set up the global variables
runner.color(true);
runner.suite.emit('global-mocha-context', runner);
runner.suite.emit('support-only', runner.options);
runner.suite.emit('modules', Tests);
require('source-map-support').install();

export function run() {
  return new Promise(function (resolve, reject) {
    runner.run(function (failures) {
      if (failures)
        reject(failures);
      else
        resolve(0);
    });
  });
}
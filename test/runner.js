import * as TestModules from './unit/extension.test.js'

const tty = require('tty');
const Mocha = require("mocha");
const esmui = require('mocha-ui-esm');

// Linux: prevent a weird NPE when mocha on Linux requires the window size from the TTY
// Since we are not running in a tty environment, we just implementt he method statically
if (!tty.getWindowSize) {
  tty.getWindowSize = function () { return [80, 75]; };
}

const runner = new Mocha({
  ui: 'esm',
  reporter: 'spec',
  useColors: true,
  timeout: 4000,
});

// set up the global variables
runner.suite.emit('global-mocha-context', runner);
runner.suite.emit('support-only', runner.options);
runner.suite.emit('modules', TestModules);
require('source-map-support').install();

export function run(onComplete) {
  runner.run(function (failures) {
    onComplete(null, failures);
  });
}
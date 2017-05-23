const System = require('systemjs');
const paths = require("path");
const glob = require("glob");
const tty = require('tty');
const Mocha = require("mocha");
const testRunner = require('../../node_modules/vscode/lib/testrunner');

// You can directly control Mocha options by uncommenting the following lines
// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info
// testRunner.configure({
//   //ui: 'tdd', 		// the TDD UI is being used in extension.test.ts (suite, test, etc.)
//   useColors: true, // colored output from test results
//   timeout: typeof this.v8debug === 'object' ? 60000 : 2000
// });

// Linux: prevent a weird NPE when mocha on Linux requires the window size from the TTY
// Since we are not running in a tty environment, we just implementt he method statically

if (!tty.getWindowSize) {
  tty.getWindowSize = function () { return [80, 75]; };
}

var runner = new Mocha({
  ui: 'bdd',
  // this line is what will allow this runner to work in both the browser and Node
  reporter: typeof window != 'undefined' ? 'html' : 'spec',
  useColors: true
});

// set up the global variables
runner.suite.emit('global-mocha-context', runner);

function run(testsRoot, clb) {
  // Enable source map support
  require('source-map-support').install();

  System.import('test/unit/extension.test')
    .then(modules => {
      compileModuleTests(modules, runner.suite);
    })
    .then(_ => {
      runner.run(function (failures) {
        clb(null, failures);
      });
    })
    .catch(error => {
      clb(error);
      console.log(error);
    });

}

const builtInFunctions = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach'];

function parseModuleProperties(moduleToParse) {
  const propertyNames = Object.keys(moduleToParse);

  const properties = propertyNames.map(name => {
    const value = moduleToParse[name];
    const isFunction = value instanceof Function;
    const isBuiltIn = isFunction && builtInFunctions.indexOf(name) > -1;
    const isOnly = isFunction === false
      && isBuiltIn === false
      && name === 'only'
      && (value === true || value === 1);

    if (isOnly) {
      runner.options.hasOnly = true;
    }
    return {
      name,
      value,
      isFunction,
      isBuiltIn,
      isOnly
    };
  });

  return properties;
}

function compileModuleTests(moduleToCompile, suite) {
  const properties = parseModuleProperties(moduleToCompile);

  let onlyFlagged = false;
  properties.forEach(property => {
    if (property.isOnly) {
      onlyFlagged = true;
      return;
    }

    if (property.isBuiltIn)
      return suite[property.name](property.value);

    if (property.isFunction) {
      const test = new Mocha.Test(property.name, property.value);
      suite.addTest(test);

      if (onlyFlagged) {
        suite._onlyTests.push(suite.tests[suite.tests.length - 1])
        onlyFlagged = false;
      }

      return;
    }

    const childSuite = Mocha.Suite.create(suite, property.name);
    if (onlyFlagged) {
      suite._onlySuites.push(suite.suites[suite.suites.length - 1])
      onlyFlagged = false;
    }

    compileModuleTests(property.value, childSuite)
  })
}

exports.run = run;

// module.exports = testRunner;
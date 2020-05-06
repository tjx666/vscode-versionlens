const System = global.System = require('systemjs')

// export the run method that will be executed by the vscode executable
exports.run = async function (testRoot, onComplete) {
  const runner = await System.import('test/runner')
  return runner.run()
    .then(failures => onComplete(null, failures))
    .catch(error => onComplete(error, null));
}

if (process.env.VSCODE_LAUNCHER != "1") {
  const { runTests } = require('vscode-test');
  const path = require('path');

  // tell vscode where our compiled test file lives
  runTests({
    extensionDevelopmentPath: path.resolve(__dirname, '../..'),
    extensionTestsPath: path.resolve(__dirname, '../test/index.js'),
    launchArgs: [
      '--disable-extensions',
    ]
  }).catch(error => {
    console.error('Something went wrong!', error);
    process.exit(1);
  });
}
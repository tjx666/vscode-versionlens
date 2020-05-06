const System = global.System = require('systemjs')
const { runTests } = require('vscode-test');
const path = require('path');

// export the run method that will be executed by the vscode executable
exports.run = async function (testRoot, onComplete) {
  const runner = await System.import('test/runner')
  await runner.run(testRoot)
  onComplete()
}

// tell vscode where our compiled test file lives
runTests({
  extensionDevelopmentPath: path.resolve(__dirname, '../..'),
  extensionTestsPath: path.resolve(__dirname, '../test/index')
}).catch(error => {
  console.error('Some tests failed');
  process.exit(1);
});
const { runTests } = require('vscode-test');
const path = require('path');

// tell vscode where our compiled test file lives
runTests({
  version: "insiders",
  extensionDevelopmentPath: path.resolve(__dirname, '..'),
  extensionTestsPath: path.resolve(__dirname, '../dist/extension.test.js'),
  launchArgs: [
    __dirname
  ]
}).catch(error => {
  console.error('Something went wrong!', error);
  process.exit(1);
});
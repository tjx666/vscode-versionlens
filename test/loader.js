const System = global.System = require('systemjs')
exports.run = function (testRoot, onComplete) {
  System.import('test/runner')
    .then(mod => {
      mod.run(onComplete)
    })
    .catch(console.error.bind(console))
}
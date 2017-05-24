const System = global.System = require('systemjs')
const Bundle = require('../out/test')

exports.run = function (testRoot, onComplete) {
  System.import('test/runner')
    .then(mod => {
      mod.run(onComplete)
    })
}
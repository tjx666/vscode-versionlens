const System = require('systemjs');

module.exports.activate = function (context) {
  System.import('extension')
    .then(entryPoint => {
      entryPoint.activate(context);
    })
    .catch(error => {
      console.error(error);
    });
}
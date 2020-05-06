const System = require('systemjs');

exports.activate = async function (context) {
  const extension = await System.import('extension');
  extension.activate(context);
}
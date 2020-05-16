const System = require('systemjs');

exports.activate = async function (context) {
  const root = await System.import('root');
  return root.activate(context);
}
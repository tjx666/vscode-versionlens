import pubRequest from "./pubRequest";

export function pubGetPackageInfo(packageName) {
  return new Promise(function (resolve, reject) {
    pubRequest
      .httpGet(packageName)
      .then(info => {
        if (!info || !info.latestStableVersion) {
          reject({
            status: 404,
            responseText: `Invalid object returned from server for '${packageName}'`
          });
          return;
        }

        resolve(info);
      })
      .catch(err => {
        reject({
          status: !err || !err.status ? 500 : err.status,
          responseText: err,
          packageName
        });
      });
  });
}

const httpRequest = require('request-light');
const semver = require('semver');

// TODO allow for mutliple sources
const MAVEN_CENTRAL = 'http://search.maven.org/solrsearch/select?q=';

export function mavenGetPackageVersions(packageName) {

  const queryUrl = `${MAVEN_CENTRAL}${packageName}&rows=9999&core=gav`;
  return new Promise(function (resolve, reject) {
    httpRequest.xhr({ url: queryUrl })
      .then(response => {
        if (response.status != 200) {
          reject({
            status: response.status,
            responseText: response.responseText
          });
          return;
        }

        const json_response = JSON.parse(response.responseText);
        let versions = []
        json_response.response.docs.forEach(doc => {
          versions.push(doc.v);
        })
        resolve(versions);
      }).catch(reject);
  });

}
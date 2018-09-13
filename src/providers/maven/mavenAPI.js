const fs = require('fs');
const os = require('os');
const xmldoc = require('xmldoc');

const httpRequest = require('request-light');

const MAVEN_CENTRAL = "https://repo.maven.apache.org/maven2/"


function loadMavenRepos() {

  let repos = []
  const homeDir = os.homedir();
  return new Promise(function (resolve, reject) {
    fs.readFile(homeDir + "/.m2/settings.xml", (err, data) => {
      if (err) {
        resolve([MAVEN_CENTRAL])
        return
      }
      let xml = new xmldoc.XmlDocument(data.toString());
      let repositories = xml.descendantWithPath("profiles.profile.repositories").childrenNamed("repository")

      repositories.forEach(element => {
        repos.push(element.childNamed("url").val)
      })
      resolve(repos)
    })
  });
}

export function mavenGetPackageVersions(packageName) {
  return new Promise(function (resolve, reject) {
    loadMavenRepos().then((repos) => {
      let [group, artifact] = packageName.split(':');
      let search = group.replace(/\./g, "/") + "/" + artifact

      Promise.all(repos.map(element => {
        const queryUrl = `${element}${search}/maven-metadata.xml`;
        return httpRequest.xhr({ url: queryUrl })
          .then(response => {
            if (response.status != 200) {
              reject({
                status: response.status,
                responseText: response.responseText
              });
              return;
            }

            // Parse XML
            let xmlRootNode = new xmldoc.XmlDocument(response.responseText);
            let xmlVersioningNode = xmlRootNode.childNamed("versioning");
            let xmlVersionsList = xmlVersioningNode.childNamed("versions").childrenNamed("version");
            let versions = []
            xmlVersionsList.forEach(xmlVersionNode => {
              versions.push(xmlVersionNode.val);
            })
            resolve(versions);
          }).catch(reject);
      }));
    });
  });

}
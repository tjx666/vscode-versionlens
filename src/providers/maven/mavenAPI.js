const { window } = require('vscode')
const { promisify } = require('util')
const fs = require('fs');
const xmldoc = require('xmldoc');
const exec = promisify(require('child_process').exec);
const httpRequest = require('request-light');

const MAVEN_CENTRAL = "https://repo.maven.apache.org/maven2/"

let repositories = []

export function loadMavenRepositories() {
  if (repositories.length > 0) {
    return Promise.resolve(repositories)
  }
  return Promise.all([
    exec('mvn help:effective-settings').then(response => {
      let regex = /<\?xml(.+\r?\n?)+\/settings>/gm;
      let xmlString = regex.exec(response.stdout.toString())[0];
      let local_repositories = [];
      let xml = new xmldoc.XmlDocument(xmlString);
      let localRepository = xml.descendantWithPath("localRepository");
      local_repositories.push(localRepository.val);
      let repositoriesXml = xml.descendantWithPath("profiles.profile.repositories").childrenNamed("repository");
      repositoriesXml.forEach(repositoryXml => {
        local_repositories.push(repositoryXml.childNamed("url").val)
      })
      return local_repositories;
    }).catch(err => {
      return MAVEN_CENTRAL
    }), new Promise(function (resolve, reject) {
      let repositories = []

      if (window.activeTextEditor) {
        let xmlCurrentPom = new xmldoc.XmlDocument(window.activeTextEditor.document.getText())
        let repositoriesCurrentPom = xmlCurrentPom.descendantWithPath("repositories")
        if (repositoriesCurrentPom) {
          repositoriesCurrentPom.eachChild(element => {
            repositories.push(element.childNamed("url").val)
          })
        }
      }
      resolve(repositories)
    })]).then(results => {
      let mergedResults = []
      results.forEach(result => {
        mergedResults = mergedResults.concat(result)
      })
      repositories = mergedResults
      return mergedResults
    })
}

export function mavenGetPackageVersions(packageName) {
  let [group, artifact] = packageName.split(':');
  let search = group.replace(/\./g, "/") + "/" + artifact
  let mergedResults = []
  return Promise.all(repositories.map(repository => {
    if (!repository.endsWith("/")) {
      repository += "/"
    }
    if (repository.startsWith("file://")) {
      const queryUrl = `${repository.replace("file://", "")}${search}/maven-metadata-local.xml`;
      return new Promise(function (resolve, reject) {
        fs.readFile(queryUrl, (err, data) => {
          console.log(err)
          console.log(data)
          if (!err) {
            let xmlRootNode = new xmldoc.XmlDocument(data);
            let xmlVersioningNode = xmlRootNode.childNamed("versioning");
            let xmlVersionsList = xmlVersioningNode.childNamed("versions").childrenNamed("version");
            let versions = []
            xmlVersionsList.forEach(xmlVersionNode => {
              versions.push(xmlVersionNode.val)
            })
            return resolve(versions)
          } else {
            return resolve([])
          }
        })
      })
    } else {
      const queryUrl = `${repository}${search}/maven-metadata.xml`;
      return httpRequest.xhr({ url: queryUrl })
        .then(response => {
          if (response.status != 200) {
            return {
              status: response.status,
              responseText: response.responseText
            }
          }

          // Parse XML
          let xmlRootNode = new xmldoc.XmlDocument(response.responseText);
          let xmlVersioningNode = xmlRootNode.childNamed("versioning");
          let xmlVersionsList = xmlVersioningNode.childNamed("versions").childrenNamed("version");
          let versions = []
          xmlVersionsList.forEach(xmlVersionNode => {
            versions.push(xmlVersionNode.val);
          })
          return versions
        }).catch(function (err) {
          return []
        })
    }
  })).then(results => {
    results.forEach(r => {
      mergedResults = mergedResults.concat(r)
    })
    return mergedResults
  });
}
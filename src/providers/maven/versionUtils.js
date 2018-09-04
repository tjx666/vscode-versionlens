String.prototype.trimChars = function (c) {
  let re = new RegExp("^[" + c + "]+|[" + c + "]+$", "g");
  return this.replace(re,"");
}

export function parseVersion(version) {
  let versionQualifier = /((?:\d+\.?){1,})(?:[-](.+))?/
  let m = versionQualifier.exec(version)
  let majorMinorBuild = /(\d+).(\d+)(?:.(\d+))?/
  let m2 = majorMinorBuild.exec(m[1])
  let versionStruct = { major: m2[1], minor: m2[2], build: m2[3] }

  let tag = 'release'
  if (m[2]) {
    if (/snapshot/i.test(m[2])) {
      tag = 'snapshot'
    } else if (/alpha/i.test(m[2])) {
      tag = 'alpha'
    } else if (/beta/i.test(m[2])) {
      tag = 'beta'
    } else if (/rc/i.test(m[2])) {
      tag = 'rc'
    } else {
      tag = m[2]
    }
  }
  return { version: versionStruct, fullVersion: version, qualifier: m[2], tag: tag };
}

function makeMap(parsed) {
  // let parsed = parseVersion(version)
  return {
    type: 'maven',
    tag: {
      name: parsed.tag,
      version: parsed.fullVersion
    }
  }
}

Array.prototype.groupBy = function(prop) {
  return this.reduce(function(groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}

export function buildMapFromVersionList(versions, requestedVersion) {
  let groupedByTag = versions.map(parseVersion).groupBy('tag')

  let onlyOneOfEach = []
  for (const key in groupedByTag) {
    if (groupedByTag.hasOwnProperty(key)) {
      onlyOneOfEach.push(groupedByTag[key][0])
    }
  }
  
  return onlyOneOfEach.map(makeMap)
}
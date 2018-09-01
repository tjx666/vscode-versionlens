String.prototype.trimChars = function (c) {
  let re = new RegExp("^[" + c + "]+|[" + c + "]+$", "g");
  return this.replace(re,"");
}

export function parseVersion(version) {
  // let versionQualifier = /((?:\d+\.?){1,3})[-\.](.+)/
  let versionQualifier = /((?:\d+\.?){1,})(?:[-](.+))?/
  let m = versionQualifier.exec(version)
  console.log(m)
  let majorMinorBuild = /(\d+).(\d+)(?:.(\d+))?/
  let m2 = majorMinorBuild.exec(m[1])
  let versionStruct = { major: m2[1], minor: m2[2], build: m2[3] }

  let tag = 'release'
  if (m[2]) {
    if (m[2].toLowerCase().includes('snapshot')) {
      tag = 'snapshot'
    } else if (m[2].toLowerCase().includes('alpha')) {
      tag = 'alpha'
    } else if (m[2].toLowerCase().includes('beta')) {
      tag = 'beta'
    } else if (m[2].toLowerCase().includes('rc')) {
      tag = 'rc'
    } else {
      tag = m[2]
    }
  }
  return { version: versionStruct, fullVersion: version, qualifier: m[2], tag: tag };
}

function makeMap(version) {
  let parsed = parseVersion(version)
  return {
    type: 'maven',
    tag: {
      name: parsed.tag,
      version: parsed.fullVersion
    }
  }
}

export function buildMapFromVersionList(versions, requestedVersion) {
  return versions.map(makeMap)
}
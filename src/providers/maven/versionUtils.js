// Sort versions using maven ComparableVersionTest.java as truth
// https://github.com/apache/maven/blob/master/maven-artifact/src/test/java/org/apache/maven/artifact/versioning/ComparableVersionTest.java

export function buildMapFromVersionList(versions, requestedVersion) {
  let versionMap = { allVersions: [], taggedVersions: [], releases: [] }
  versions = versions.sort(compareVersions).reverse()
  versionMap.allVersions = versions.slice()
  versions.forEach(version => {
    if (/beta|b/i.test(version)) {
      versionMap.taggedVersions.push(version)
    } else if (/snapshot/i.test(version)) {
      versionMap.taggedVersions.push(version)
    } else if (/ga|final/i.test(version)) {
      versionMap.releases.push(version)
    } else if (/alpha|a/i.test(version)) {
      versionMap.taggedVersions.push(version)
    } else if (/milestone|m/i.test(version)) {
      versionMap.taggedVersions.push(version)
    } else if (/cr|rc/i.test(version)) {
      versionMap.taggedVersions.push(version)
    } else if (/sp/i.test(version)) {
      versionMap.taggedVersions.push(version)
    } else {
      versionMap.releases.push(version)
    }
  });
  return versionMap
}

function isOlderVersion(versionA, versionB) {
  return compareVersions(versionA, versionB) < 0
}

export function buildTagsFromVersionMap(versionMap, requestedVersion) {

  let versionMatchNotFound = versionMap.allVersions.indexOf(requestedVersion) >= 0 ? false : true

  const latestEntry = {
    name: "latest",
    version: versionMap.releases[0] || versionMap.taggedVersions[0],
    // can only be older if a match was found and requestedVersion is a valid range
    isOlderThanRequested: !versionMatchNotFound && isOlderVersion(versionMap.releases[0] || versionMap.taggedVersions[0], requestedVersion),
    isPrimaryTag: true
  };

  const requestedEntry = {
    name: 'current',
    version: requestedVersion,
    versionMatchNotFound: versionMatchNotFound,
    isFixedVersion: true,
    isPrimaryTag: true,
    isLatestVersion: compareVersions(latestEntry.version, requestedVersion) === 0,
    order: 0
  }

  let releases = latestOfEachMajor(versionMap.releases)
  let tagged = latestOfEachMajor(versionMap.taggedVersions)

  if (requestedEntry.isLatestVersion) {
    releases.splice(releases.indexOf(latestEntry.version), 1)
    tagged.splice(tagged.indexOf(latestEntry.version), 1)
  }
  if (releases.indexOf(requestedEntry.version) >= 0) {
    releases.splice(releases.indexOf(requestedEntry.version), 1)
  }
  if (tagged.indexOf(requestedEntry.version) >= 0) {
    tagged.splice(tagged.indexOf(requestedEntry.version), 1)
  }

  let taggedReleases = releases.map(item => {
    return {
      isPrimaryTag: true,
      version: item,
      isOlderThanRequested: compareVersions(item, requestedVersion) < 0
    }
  })

  let taggedVersions = tagged.map(item => {
    let name = ''
    if (/beta|b/i.test(item)) {
      name = 'beta'
    } else if (/snapshot/i.test(item)) {
      name = 'snapshot'
    } else if (/alpha|a/i.test(item)) {
      name = 'alpha'
    } else if (/milestone|m/i.test(item)) {
      name = 'milestone'
    } else if (/cr|rc/i.test(item)) {
      name = 'rc'
    } else if (/sp/i.test(item)) {
      name = 'sp'
    }
    return {
      name: name,
      version: item
    }
  })

  let response = [
    requestedEntry,
    ...taggedReleases,
    ...taggedVersions
  ]

  return response
}

export function parseVersion(version) {
  if (!version) {
    return []
  }
  let parsedVersion = version.toLowerCase()
  parsedVersion = parsedVersion.replace(/-/g, ",[") // Opening square brackets for dashes

  parsedVersion = parsedVersion.replace(/\./g, ",") // Dots for commas
  parsedVersion = parsedVersion.replace(/([0-9]+)([a-z]+)/g, "$1,$2") // Commas
  parsedVersion = parsedVersion.replace(/([a-z]+)([0-9]+)/g, "$1,$2") // Commas everywhere

  let squareBracketCount = parsedVersion.match(/\[/g) // Closing square brackets
  if (squareBracketCount) {
    parsedVersion += "]".repeat(squareBracketCount.length)
  }
  parsedVersion = "[" + parsedVersion + "]" // All to big array
  parsedVersion = parsedVersion.replace(/(\w+)/g, '"$1"') // Quoted items
  let arrayVersion = JSON.parse(parsedVersion) // Transform String to Array
  arrayVersion = arrayVersion.map(toNumber) // Number String to Number
  arrayVersion = arrayVersion.map(weightedQualifier) // Qualifiers to weight

  return arrayVersion
}

function toNumber(item) {
  if (item instanceof Array) {
    return item.map(toNumber)
  }
  return parseInt(item) >= 0 ? parseInt(item) : item
}

export function weightedQualifier(item) {
  if (item instanceof Array) {
    return item.map(weightedQualifier)
  }
  else if (typeof item == 'string') {
    switch (item) {
      case 'a': // Alpha least important
      case 'alpha':
        return -7
      case 'b':
      case 'beta':
        return -6
      case 'm':
      case 'milestone':
        return -5
      case 'rc': // Release candidate
      case 'cr':
        return -4
      case 'snapshot':
        return -3
      case 'ga':
      case 'final':
        return -2
      case 'sp': // Security Patch most important
        return -1
      default: // Same as GA, FINAL
        return item
    }
  }
  return item
}

function compare(a, b) {
  if (typeof a == 'number' && typeof b == 'number') {
    return a - b
  } else if (a instanceof Array && b instanceof Array) {
    let r = 0
    for (let index = 0; index < a.length; index++) {
      r += compare(a[index], b[index])
    }
    return r
  } else if (a instanceof Array && typeof b === 'number') {
    return -1
  } else if (a instanceof Array && b === undefined) {
    return -1
  } else if (typeof a === 'number' && b === undefined) {
    if (a === 0) {
      return 0
    }
    return 1
  } else if (typeof a === 'number' && b instanceof Array) {
    return -1
  } else if (a === undefined && b instanceof Array) {
    return -1
  } else if (a === undefined && typeof b === 'number') {
    if (b === 0) {
      return 0
    }
    return -1
  } else if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b)
  } else if (typeof a === 'string' && typeof b === 'number') {
    return -1
  } else if (typeof a === 'number' && typeof b === 'string') {
    return 1
  }
}

export function compareVersions(versionA, versionB) {
  let itemA = parseVersion(versionA)
  let itemB = parseVersion(versionB)
  let length = itemA.length > itemB.length ? itemA.length : itemB.length
  let sum = 0
  for (let index = 0; index < length; index++) {
    const elementA = itemA[index];
    const elementB = itemB[index];
    let c = compare(elementA, elementB)
    if (c !== 0) {
      return c
    }
    sum += c
  }
  return sum
}

function latestOfEachMajor(list) {
  list = list.sort(compareVersions).reverse()
  let lastMajor = -1
  let latestOfEachMajor = []
  for (const v of list) {
    let currentMajor = parseVersion(v)[0]
    if (lastMajor != currentMajor) {
      latestOfEachMajor.push(v)
    }
    lastMajor = currentMajor
  }
  return latestOfEachMajor
}
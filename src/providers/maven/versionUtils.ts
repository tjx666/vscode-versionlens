export function buildMapFromVersionList(versions, requestedVersion) {
  let versionMap = { allVersions: [], taggedVersions: [], releases: [] }
  versions = versions.sort(compareVersions).reverse()
  versionMap.allVersions = versions.slice()
  versions.forEach(version => {
    let tagged = null
    if (/alpha|a/.test(version)) {
      tagged = { name: 'alpha', version: version }
      versionMap.taggedVersions.push(tagged)
    } else if (/beta|b/.test(version)) {
      tagged = { name: 'beta', version: version }
      versionMap.taggedVersions.push(tagged)
    } else if (/milestone|m/.test(version)) {
      tagged = { name: 'milestone', version: version }
      versionMap.taggedVersions.push(tagged)
    } else if (/cr|rc/.test(version)) {
      tagged = { name: 'rc', version: version }
      versionMap.taggedVersions.push(tagged)
    } else if (/snapshot/.test(version)) {
      tagged = { name: 'snapshot', version: version }
      versionMap.taggedVersions.push(tagged)
    } else if (/sp/.test(version)) {
      tagged = { name: 'sp', version: version }
      versionMap.taggedVersions.push(tagged)
    } else if (/ga|final/.test(version)) {
      versionMap.releases.push(version)
    } else {
      versionMap.releases.push(version)
    }
  });
  return versionMap
}

function isOlderVersion(versionA, versionB) {
  return compareVersions(versionA, versionB) < 0 ? true : false
}

export function buildTagsFromVersionMap(versionMap, requestedVersion) {

  let versionMatchNotFound = versionMap.allVersions.indexOf(requestedVersion) >= 0 ? false : true

  const latestEntry = {
    name: "latest",
    version: versionMap.releases[0] || versionMap.taggedVersions[0].version,
    // can only be older if a match was found and requestedVersion is a valid range
    isOlderThanRequested: !versionMatchNotFound && isOlderVersion(versionMap.releases[0] || versionMap.taggedVersions[0].version, requestedVersion),
    isLatestVersion: compareVersions(versionMap.releases[0], requestedVersion) == 0,
    isPrimaryTag: true
  };

  const requestedEntry = {
    name: 'current',
    version: requestedVersion,
    versionMatchNotFound: versionMatchNotFound,
    isFixedVersion: true,
    isPrimaryTag: true,
    order: 0
  }

  let releases: string[] = latestOfEachMajor(versionMap.releases)

  releases.splice(releases.indexOf(latestEntry.version), 1)

  let taggedReleases = releases.map(item => {
    return {
      isPrimaryTag: true,
      version: item,
      isOlderThanRequested: compareVersions(item, requestedVersion) < 0,
      isFixedVersion: compareVersions(item, requestedVersion) === 0
    }
  })

  let response = [
    latestEntry,
    ...taggedReleases,
    ...versionMap.taggedVersions
  ]

  if (latestEntry.version !== requestedEntry.version && releases.indexOf(requestedEntry.version) < 0) {
    response.push(requestedEntry)
  }

  return response
}

export function parseVersion(version): any[] {
  if (!version) {
    return []
  }
  let parsedVersion: string = version.toLowerCase()
  parsedVersion = parsedVersion.replace(/-/g, ",[") // Opening square brackets for dashes

  parsedVersion = parsedVersion.replace(/\./g, ",") // Dots for commas
  parsedVersion = parsedVersion.replace(/([0-9]+)([a-z]+)/g, "$1,$2") // Commas
  parsedVersion = parsedVersion.replace(/([a-z]+)([0-9]+)/g, "$1,$2") // Commas everywhere

  let squareBracketCount = parsedVersion.match(/\[/g) // Closing square brackets
  if (squareBracketCount) {
    parsedVersion += "]".repeat(squareBracketCount.length)
  }
  parsedVersion = "[" + parsedVersion + "]" // All to big array
  parsedVersion = parsedVersion.replace(/(\w+)/g, "'$1'") // Quoted items
  let arrayVersion: any[] = eval(parsedVersion) // Transform String to Array
  arrayVersion = arrayVersion.map(toNumber) // Number String to Number
  arrayVersion = arrayVersion.map(weightedQualifier) // Qualifiers to weight

  arrayVersion = removeIgnoredQualifiers(arrayVersion)

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
        return 1
      case 'b':
      case 'beta':
        return 2
      case 'm':
      case 'milestone':
        return 3
      case 'rc': // Release candidate
      case 'cr':
        return 4
      case 'snapshot':
        return 5
      case 'ga':
      case 'final':
        return -1
      case 'sp': // Security Patch most important
        return 7
      default: // Same as GA, FINAL
        return -1
    }
  }
  return item
}

function removeIgnoredQualifiers(list) {
  for (let item of list) {
      if (item instanceof Array) {
          removeIgnoredQualifiers(item)
      }
      if (typeof item == 'number' && item < 0) {
          list = list.splice(list.indexOf[item], 1)
      }
  }
  return list
}

function compareArray(itemA, itemB) {
  let partial = 0
  let bigger = itemA.length > itemB.length ? itemA.length : itemB.length
  for (let i = 0; i < bigger; i++) {
    if (typeof itemA[i] == 'number' && typeof itemB[i] == 'number') {
      partial = itemA[i] - itemB[i]
      if (partial != 0) {
        break;
      }
    } else if (typeof itemA[i] == 'number' && itemB[i] instanceof Array) {
      return 1
    } else if (itemA[i] instanceof Array && typeof itemB[i] == 'number') {
      return -1
    } else if (itemA[i] == undefined) {
      return -1
    } else if (itemB[i] == undefined) {
      return 1
    } else if (itemA[i] instanceof Array && itemB[i] instanceof Array) {
      return compareArray(itemA[i], itemB[i])
    }
  }
  return partial
}

export function compareVersions(versionA, versionB) {
  let itemA = parseVersion(versionA)
  let itemB = parseVersion(versionB)
  return compareArray(itemA, itemB)
}

function latestOfEachMajor(list: string[]) {
  list = list.sort(compareVersions).reverse()
  let lastMajor = -1
  let latestOfEachMajor: string[] = []
  for (const v of list) {
    let currentMajor = parseVersion(v)[0]
    if (lastMajor != currentMajor) {
      latestOfEachMajor.push(v)
    }
    lastMajor = currentMajor
  }
  return latestOfEachMajor
}
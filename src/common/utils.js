export const fileDependencyRegex = /^file:(.*)$/;
export const gitHubDependencyRegex = /^\/?([^:\/\s]+)(\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
export const stripSymbolFromVersionRegex = /^(?:[^0-9]+)?(.+)$/;
export const extractSymbolFromVersionRegex = /^([^0-9]*)?.*$/;
export const semverLeadingChars = ['^', '~', '<', '<=', '>', '>=', '~>'];
export const formatTagNameRegex = /^[^0-9\-]*/;

export function formatWithExistingLeading(existingVersion, newVersion) {
  const regExResult = extractSymbolFromVersionRegex.exec(existingVersion);
  const leading = regExResult && regExResult[1];
  if (!leading || !semverLeadingChars.includes(leading))
    return newVersion;

  return `${leading}${newVersion}`;
}

export function sortDescending(a, b) {
  if (a > b)
    return -1;
  if (a < b)
    return 1;
  return 0;
}
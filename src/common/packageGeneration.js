export function generateNotSupportedPackage(name, version, type) {
  return {
    name,
    version,
    meta: {
      type,
      notSupported: true,
      message: "Package registry not supported"
    }
  };
}

export function generateNotFoundPackage(name, version, type) {
  return {
    name,
    version,
    meta: {
      type,
      notSupported: true,
      message: `${name} could not be found`
    }
  };
}

export function generatePackage(name, version, info, customGenerateVersion) {
  return {
    name,
    version,
    meta: info,
    customGenerateVersion
  };
}
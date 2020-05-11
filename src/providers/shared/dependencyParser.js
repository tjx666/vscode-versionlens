export function resolvePackageLensData(packagePath, packageDepsLenses, customPackageResolver = null) {
  const collector = [];

  packageDepsLenses.forEach(
    function (lens) {
      let packageEntries = null;

      if (customPackageResolver) {
        const { name, version } = lens.packageInfo;
        packageEntries = customPackageResolver(packagePath, name, version);

        // if the package wasn't resolved then skip
        if (!packageEntries) throw new Error("hmmmmmm");

        // // ensure the result is a promise
        packageEntries = Promise.resolve(packageEntries)
          .then(function (reportItem) {
            if (Array.isArray(reportItem) === false)
              return [{ node: lens, package: reportItem }];

            return reportItem.map(
              pkg => {
                return { node: lens, package: pkg }
              }
            );
          });
      }

      if (!packageEntries) packageEntries = Promise.resolve({ node: lens });

      collector.push(packageEntries);
    }
  );

  return collector;
}

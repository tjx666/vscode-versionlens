/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function resolvePackageLensData(packageLenses, appContrib, customPackageResolver = null) {
  const collector = [];

  packageLenses.forEach(
    function (node) {
      let result = null;
      if (customPackageResolver) {
        const { name, version } = node.packageInfo;
        result = customPackageResolver(name, version, appContrib);

        // if the package wasn't resolved then skip
        if (!result) return;

        // ensure the result is a promise
        result = Promise.resolve(result)
          .then(function (packageOrPackages) {
            if (Array.isArray(packageOrPackages) === false)
              return [{ node, package: packageOrPackages }];

            return packageOrPackages.map(
              pkg => {
                return { node, package: pkg }
              }
            );
          });
      }

      if (!result) result = Promise.resolve({ node });

      collector.push(result);
    }
  );

  return collector;
}

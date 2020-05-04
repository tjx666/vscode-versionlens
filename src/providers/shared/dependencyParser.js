/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function parseDependencyNodes(dependencyNodes, appContrib, customPackageParser = null) {
  const collector = [];

  dependencyNodes.forEach(
    function (node) {
      let result = null;
      if (customPackageParser) {
        const { name, version } = node.packageInfo;
        result = customPackageParser(name, version, appContrib);

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

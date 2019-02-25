/* eslint-disable object-shorthand */

/**
 * Takes the template and returns a string contents of the package.json.
 */
module.exports = template => {
  const packageJson = template.packageJson;

  // Add additional dependencies if specified
  if (template.install) {
    Object.entries(template.install).forEach(([depName, depVersion]) => {
      packageJson.dependencies[depName] = depVersion;
    });
  }

  return JSON.stringify(packageJson, null, 2);
};

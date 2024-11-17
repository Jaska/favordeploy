/**
 * To override the default deploy function, create a file named `favordeploy.deploy.js` in the root of your project.
 * This file is an example boilerplate for a custom deploy function.
 */

function deploy(deployIgnoreFile = ".deployignore") {
  console.log("CUSTOM DEPLOY FUNCTION");
}

module.exports = {
  deploy,
};

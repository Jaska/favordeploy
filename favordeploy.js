const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { get } = require("browser-sync");
const processPath = process.cwd(); // Base path of the project, has .env files etc.

// Run the main deployment function
main();

// Main function to run deployment
function main() {
  console.log("=========================");
  console.log("====== FAVORDEPLOY ======");
  console.log("=========================");

  const envFile = getEnvFileParameter();

  checkEnvFile(envFile);

  loadEnvFile(envFile);

  // Step 3: Print out loaded variables for confirmation
  console.log(`USERNAME: ${process.env.USERNAME}`);
  console.log(`HOST: ${process.env.HOST}`);
  console.log(`WP_ROOT_DIR: ${process.env.WP_ROOT_DIR}`);
  console.log(`WP_THEME_DIR: ${process.env.WP_THEME_DIR}`);

  // Step 4: Check required environment variables
  checkRequiredEnvVars();

  // Step 5: Build assets and deploy
  buildAssets();

  const { deploy } = getCustomDeployFunction();
  deploy(getDeployIgnoreFilePath());

  console.log("=======================");
  console.log("====== DEPLOYED! ======");
  console.log("=======================");
}

function getEnvFileParameter() {
  const envFile = `.${process.argv[2]}.env`; // Get the environment file name from command line argument

  if (!process.argv[2] || !fs.existsSync(envFile)) {
    console.error(
      "Please provide a .env file name (staging, production, etc.) - without periods!\n"
    );
    const content =
      fs.readFileSync(path.join(__dirname, ".example.env"), "utf8") ||
      ("Error: Could not read .example.env file" && process.exit(1));
    console.log(
      "Put .staging.env, .production.env or anything in the root with this content:\n" +
        content
    );
    process.exit(1);
  }
  return envFile;
}

function checkEnvFile(envFile) {
  if (!fs.existsSync(envFile)) {
    console.error("Error: .env file not found!");
    process.exit(1);
  }
}

function loadEnvFile(envFile) {
  const envConfig = require("dotenv").config({ path: envFile });
  if (envConfig.error) {
    console.error(`Error: Could not load ${envFile}`);
    process.exit(1);
  }
}

function checkRequiredEnvVars() {
  const requiredVars = ["USERNAME", "HOST", "WP_ROOT_DIR", "WP_THEME_DIR"];
  for (let varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`Error: Missing environment variable: ${varName}`);
      process.exit(1);
    }
  }
}

function buildAssets() {
  try {
    console.log("Building assets...");
    execSync("npm run build", { stdio: "inherit" });
  } catch (error) {
    console.error("Build failed");
    process.exit(1);
  }
}

function getDeployIgnoreFilePath() {
  // use .deployignore file in root if it exists, otherwise use one in in the script directory
  const deployIgnoreFile = path.join(processPath, ".deployignore");
  if (fs.existsSync(deployIgnoreFile)) {
    return deployIgnoreFile;
  }
  return path.join(__dirname, ".deployignore");
}

function getCustomDeployFunction() {
  const customDeployFile = path.join(processPath, "favordeploy.deploy.js");
  if (fs.existsSync(customDeployFile)) {
    console.log(`Using custom deploy file: ${customDeployFile}`);
    return require(customDeployFile);
  }
  return { deploy: defaultDeploy };
}

function defaultDeploy(deployIgnoreFile = ".deployignore") {
  checkDeployRequirements();

  const deployCommand = `rsync -avz --delete --delete-excluded --exclude-from='${deployIgnoreFile}' . ${process.env.USERNAME}@${process.env.HOST}:${process.env.WP_THEME_DIR}`;
  try {
    console.log("Deploying theme...");
    execSync(deployCommand, { stdio: "inherit" });
  } catch (error) {
    console.error("Deployment failed");
    process.exit(1);
  }
}

/**
 * checkDeployRequirements
 * Kind of late in the deployment, but only because these might change depending on the deployment script
 * - which can be ovverriden.
 */
function checkDeployRequirements() {
  try {
    execSync("rsync --version", { stdio: "ignore" });
  } catch (error) {
    console.error("Error: rsync is not installed");
    process.exit(1);
  }
}

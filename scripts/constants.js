const { join } = require("path");

const rootPath = join(__dirname, "..");
const configPath = join(rootPath, "config");

const workspacePath = join(rootPath, "pnpm-workspace.yaml");
const rootPackageJSONPath = join(rootPath, "package.json");

module.exports.configPath = configPath;
module.exports.workspacePath = workspacePath;
module.exports.rootPackageJSONPath = rootPackageJSONPath;

const { join } = require("path");

const rootPath = join(__dirname, "..");
const configPath = join(rootPath, "config");

module.exports = {
  configPath,
};

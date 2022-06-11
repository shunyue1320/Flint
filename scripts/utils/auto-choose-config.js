const path = require("path");
const { configPath } = require("../constants");

const autoChooseConfig = () => {
  return path.join(configPath);
};

module.exports = {
  autoChooseConfig,
};

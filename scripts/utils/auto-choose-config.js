const path = require("path");
const { configPath } = require("../constants");

const configRegion = () => {
  const DEFAULT = Intl.DateTimeFormat().resolvedOptions().locale.indexOf("zh") !== -1 ? "CN" : "US";
  return process.env.FLAT_REGION || DEFAULT;
};

const autoChooseConfig = () => {
  return path.join(configPath);
};

module.exports = {
  configRegion,
  autoChooseConfig,
};

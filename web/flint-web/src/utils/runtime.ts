import { runtime as Runtime } from "flint-types";

export const runtime: Runtime.Type = {
  isDevelopment: false,
  isProduction: false,
  startURL: "",
  isMac: false,
  isWin: false,
  staticPath: "",
  preloadPath: "",
  assetsPath: "",
  appVersion: "",
  downloadsDirectory: "",
};

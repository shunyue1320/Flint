import { initUI } from "./init-ui";
import { initFlintServices } from "./init-flint-services";
// import { initFlatRTC } from "../services/flat-rtc";

export const tasks = [initFlintServices, initUI];

import { initUI } from "./init-ui";
import { initFlatRTC } from "../services/flat-rtc";

export const tasks = [initFlatRTC, initUI];

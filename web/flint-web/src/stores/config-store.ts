import { Region } from "flint-components";
import { autoPersistStore } from "./utils";
import { i18n } from "../utils/i18n";

// 如果不匹配，则清除存储
const LS_VERSION = 1;

export class ConfigStore {
  // 加入房间时打开摄像机
  public autoCameraOn = false;
  // 加入房间时打开麦克风
  public autoMicOn = true;
  // 服务器区域，默认语言
  public region: Region | null = null;
  // 设备测试页面上的选定摄像机设备id
  public cameraId?: string;
  // 设备测试页面上的选定麦克风设备id
  public microphoneId?: string;

  public constructor() {
    autoPersistStore({ storeLSName: "ConfigStore", store: this, version: LS_VERSION });
  }

  public updateAutoMicOn = (isOn: boolean): void => {
    this.autoMicOn = isOn;
  };

  public updateAutoCameraOn = (isOn: boolean): void => {
    this.autoCameraOn = isOn;
  };

  public updateCameraId = (cameraId: string): void => {
    this.cameraId = cameraId;
  };

  public updateMicrophoneId = (microphoneId: string): void => {
    this.microphoneId = microphoneId;
  };

  public getRegion = (): Region => {
    return this.region || (i18n.language.startsWith("zh") ? Region.CN_HZ : Region.US_SV);
  };

  public setRegion = (region: Region): void => {
    this.region = region;
  };
}

export const configStore = new ConfigStore();

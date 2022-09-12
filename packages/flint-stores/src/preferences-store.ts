import { FlintPrefersColorScheme } from "@netless/flint-components";
import { FlintI18n } from "@netless/flint-i18n";
import { autoPersistStore } from "./utils/auto-persist-store";

export enum Region {
  CN_HZ = "cn-hz",
  US_SV = "us-sv",
  SG = "sg",
  IN_MUM = "in-mum",
  GB_LON = "gb-lon",
}

// 如果存储版本不匹配，则清除存储
const LS_VERSION = 1;

/**
 * 用户偏好
 *
 * 首选项存储中的属性是持久化的，并全局共享.
 */
export class PreferencesStore {
  /** 加入房间时打开摄像机 */
  public autoCameraOn = false;
  /** 加入房间时打开麦克风 */
  public autoMicOn = true;
  /** 区域，默认为语言 */
  public region: Region | null = null;
  /** 在设备测试页面上选择的摄像机设备id */
  public cameraId?: string | null = null;
  /** 在“设备测试”页面上选择的麦克风设备id */
  public microphoneId?: string | null = null;

  public prefersColorScheme: FlintPrefersColorScheme = "light";

  public constructor() {
    autoPersistStore({ storeLSName: "PreferencesStore", store: this, version: LS_VERSION });
  }

  public updateAutoCameraOn = (isOn: boolean): void => {
    this.autoCameraOn = isOn;
  };

  public updateAutoMicOn = (isOn: boolean): void => {
    this.autoMicOn = isOn;
  };

  public updateCameraId = (cameraId: string): void => {
    this.cameraId = cameraId;
  };

  public updateMicrophoneId = (microphoneId: string): void => {
    this.microphoneId = microphoneId;
  };

  public setRegion = (region: Region): void => {
    this.region = region;
  };

  public getRegion = (): Region => {
    return (
      this.region ||
      (FlintI18n.getInstance().language.startsWith("zh") ? Region.CN_HZ : Region.US_SV)
    );
  };

  public updatePrefersColorScheme = (prefersColorScheme: FlintPrefersColorScheme): void => {
    this.prefersColorScheme = prefersColorScheme;
  };
}

export const preferencesStore = new PreferencesStore();

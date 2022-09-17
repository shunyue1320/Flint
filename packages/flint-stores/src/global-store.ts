import { autoPersistStore } from "./utils/auto-persist-store";
import { LoginProcessResult } from "@netless/flint-server-api";

enum Region {
  CN_HZ = "cn-hz",
  US_SV = "us-sv",
  SG = "sg",
  IN_MUM = "in-mum",
  GB_LON = "gb-lon",
}

// 存储版本不匹配，则清除存储
const LS_VERSION = 1;

export type UserInfo = LoginProcessResult;

/** 全局存储中的属性是全局持久化和共享的。*/
export class GlobalStore {
  public isShowGuide = false;
  public userInfo: UserInfo | null = null;
  public lastLoginCheck: number | null = null;
  public isTurnOffDeviceTest = false;

  public whiteboardRoomUUID: string | null = null;
  public whiteboardRoomToken: string | null = null;
  public region: Region | null = null;
  public rtcToken: string | null = null;
  public rtcUID: number | null = null;
  public rtcShareScreen: {
    uid: number;
    token: string;
  } | null = null;
  public rtmToken: string | null = null;

  public get userUUID(): string | undefined {
    return this.userInfo?.userUUID;
  }

  public get userName(): string | undefined {
    return this.userInfo?.name;
  }

  public constructor() {
    autoPersistStore({ storeLSName: "GlobalStore", store: this, version: LS_VERSION });
  }

  public updateUserInfo = (userInfo: UserInfo | null): void => {
    this.userInfo = userInfo;
  };

  public updateLastLoginCheck = (val: number | null): void => {
    this.lastLoginCheck = val;
  };

  public toggleDeviceTest = (): void => {
    this.isTurnOffDeviceTest = !this.isTurnOffDeviceTest;
  };

  public logout = (): void => {
    this.userInfo = null;
    this.lastLoginCheck = null;
  };

  public updateToken = (
    config: Partial<
      Pick<
        GlobalStore,
        | "whiteboardRoomUUID"
        | "whiteboardRoomToken"
        | "rtcToken"
        | "rtmToken"
        | "rtcUID"
        | "rtcShareScreen"
        | "region"
      >
    >,
  ): void => {
    const keys = [
      "whiteboardRoomUUID",
      "whiteboardRoomToken",
      "rtcToken",
      "rtmToken",
      "rtcUID",
      "rtcShareScreen",
      "region",
    ] as const;

    for (const key of keys) {
      const value = config[key];
      if (value !== null && value !== undefined) {
        this[key] = value as any;
      }
    }
  };
}

export const globalStore = new GlobalStore();

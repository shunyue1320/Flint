import { autoPersistStore } from "./utils";
import { LoginProcessResult } from "../api-middleware/flatServer";

// 存储版本不匹配，则清除存储
const LS_VERSION = 1;

export type UserInfo = Omit<LoginProcessResult, "agoraSSOLoginID">;

// 全局存储中的属性是全局持久化和共享的。
export class GlobalStore {
  public userInfo: UserInfo | null = null;
  public lastLoginCheck: number | null = null;
  public isTurnOffDeviceTest = false;

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
}

export const globalStore = new GlobalStore();

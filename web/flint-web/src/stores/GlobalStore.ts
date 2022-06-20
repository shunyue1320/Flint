import { autoPersistStore } from "./utils";
import { LoginProcessResult } from "../api-middleware/flatServer";

// 存储版本不匹配，则清除存储
const LS_VERSION = 1;

export type UserInfo = Omit<LoginProcessResult, "agoraSSOLoginID">;

// 全局存储中的属性是全局持久化和共享的。
export class GlobalStore {
  public userInfo: UserInfo | null = null;

  public constructor() {
    autoPersistStore({ storeLSName: "GlobalStore", store: this, version: LS_VERSION });
  }

  public updateUserInfo = (userInfo: UserInfo | null): void => {
    this.userInfo = userInfo;
  };
}

export const globalStore = new GlobalStore();

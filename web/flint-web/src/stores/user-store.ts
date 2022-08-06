import { makeAutoObservable } from "mobx";

export interface User {
  userUUID: string;
  rtcUID: number;
  avatar: string;
  name: string;
  camera: boolean;
  mic: boolean;
  isSpeak: boolean;
  isRaiseHand: boolean;
}

export class UserStore {
  public readonly roomUUID: string;
  /** 当前用户 uuid */
  public readonly userUUID: string;
  /** 房主 uuid */
  public readonly ownerUUID: string;
  /** 当前用户信息 */
  public currentUser: User | null = null;

  public constructor(config: { userUUID: string; ownerUUID: string; roomUUID: string }) {
    this.roomUUID = config.roomUUID;
    this.userUUID = config.userUUID;
    this.ownerUUID = config.ownerUUID;

    makeAutoObservable(this);
  }
}

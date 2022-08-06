import { makeAutoObservable, observable } from "mobx";

import { usersInfo } from "../api-middleware/flatServer";
import { configStore } from "./config-store";

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
  /** 缓存所有用户信息，包括已离开房间的用户 */
  public cachedUsers = observable.map<string, User>();
  /** 创建者信息 */
  public creator: User | null = null;
  /** 当前用户信息 */
  public currentUser: User | null = null;
  /** 有发言权的加入者 */
  public speakingJoiners = observable.array<User>([]);
  /** 举手的用户 */
  public handRaisingJoiners = observable.array<User>([]);
  /** 其余的用户 */
  public otherJoiners = observable.array<User>([]);

  public get isCreator(): boolean {
    return this.ownerUUID === this.userUUID;
  }

  public constructor(config: { userUUID: string; ownerUUID: string; roomUUID: string }) {
    this.roomUUID = config.roomUUID;
    this.userUUID = config.userUUID;
    this.ownerUUID = config.ownerUUID;

    makeAutoObservable(this);
  }

  public initUsers = async (userUUIDs: string[]): Promise<void> => {
    this.otherJoiners.clear();
    this.speakingJoiners.clear();
    this.handRaisingJoiners.clear();
    const users = await this.createUsers(userUUIDs);
    users.forEach(user => {
      this.sortUser(user);
      this.cacheUser(user);
    });
  };

  /**
   * 将用户分组。
   * 用户对象应该是可观察的。
   */
  private sortUser = (user: User): void => {
    if (user.userUUID === this.userUUID) {
      this.currentUser = user;
    }

    if (user.userUUID === this.ownerUUID) {
      this.creator = user;
    }
  };

  private cacheUser(user: User): void {
    this.cachedUsers.set(user.userUUID, user);
  }

  /**
   * 获取用户信息并返回可观察的用户列表
   */
  private async createUsers(userUUIDs: string[]): Promise<User[]> {
    userUUIDs = [...new Set(userUUIDs)];

    if (userUUIDs.length <= 0) {
      return [];
    }

    const users = await usersInfo({ roomUUID: this.roomUUID, usersUUID: userUUIDs });

    return userUUIDs.map(userUUID =>
      // 必须首先转换为observable，以便其他逻辑可以重用它
      observable.object<User>({
        userUUID,
        rtcUID: users[userUUID].rtcUID,
        avatar: users[userUUID].avatarURL,
        name: users[userUUID].name,
        camera: userUUID === this.userUUID ? configStore.autoCameraOn : false,
        mic: userUUID === this.userUUID ? configStore.autoMicOn : false,
        isSpeak: userUUID === this.userUUID && this.isCreator,
        isRaiseHand: false,
      }),
    );
  }
}

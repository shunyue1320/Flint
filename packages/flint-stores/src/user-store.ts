import { makeAutoObservable, observable, action } from "mobx";

import { usersInfo } from "@netless/flint-server-api";
import { preferencesStore } from "./preferences-store";

export interface User {
  userUUID: string;
  rtcUID: string;
  avatar: string;
  name: string;
  camera: boolean;
  mic: boolean;
  isSpeak: boolean;
  isRaiseHand: boolean;
  hasLeft: boolean;
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

  public isInRoom: (userUUID: string) => boolean;

  public constructor(config: {
    userUUID: string;
    ownerUUID: string;
    roomUUID: string;
    isInRoom: (userUUID: string) => boolean;
  }) {
    this.roomUUID = config.roomUUID;
    this.userUUID = config.userUUID;
    this.ownerUUID = config.ownerUUID;
    this.isInRoom = config.isInRoom;

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

  public addUser = async (userUUID: string): Promise<void> => {
    if (this.cachedUsers.has(userUUID)) {
      this.removeUser(userUUID);
    }
    const [user] = await this.createUsers([userUUID]);
    this.cacheUser(user);
    this.sortUser(user);
  };

  public removeUser = (userUUID: string): void => {
    if (this.creator && this.creator.userUUID === userUUID) {
      this.creator = null;
    } else {
      for (const { group } of this.joinerGroups) {
        for (let i = 0; i < this[group].length; i++) {
          this[group].splice(i, 1);
          break;
        }
      }
    }
  };

  private readonly joinerGroups = [
    { group: "speakingJoiners", shouldMoveOut: (user: User): boolean => !user.isSpeak },
    { group: "handRaisingJoiners", shouldMoveOut: (user: User): boolean => !user.isRaiseHand },
    {
      group: "otherJoiners",
      shouldMoveOut: (user: User): boolean => user.isRaiseHand || user.isSpeak,
    },
  ] as const;

  /**
   * 更新用户状态并自动排序到不同的组中。
   * @param editUser 更新用户状态。此回调将应用于所有用户。
   * 返回“false”以停止遍历。
   */
  public updateUsers = (editUser: (user: User) => boolean | void): void => {
    // action 包裹的回调函数中有响应式数据就触发响应式
    const editUserAction = action("editUser", editUser);
    const unSortedUsers: User[] = [];

    let shouldStopEditUser = false;

    // 创建者更新回调就返回创建者
    if (this.creator) {
      shouldStopEditUser = editUserAction(this.creator) === false;
    }

    for (const { group, shouldMoveOut } of this.joinerGroups) {
      if (shouldStopEditUser) {
        break;
      }

      for (let i = 0; i < this[group].length; i++) {
        if (shouldStopEditUser) {
          break;
        }

        const user = this[group][i];
        shouldStopEditUser = editUserAction(user) === false;
        if (shouldMoveOut(user)) {
          this[group].splice(i, 1);
          i--;
          unSortedUsers.push(user);
        }
      }
    }

    // 将每个未排序的用户排序到不同的组中
    unSortedUsers.forEach(this.sortUser);
  };

  /**
   * 将用户分组。
   * 用户对象应该是可观察的。
   */
  private sortUser = (user: User): void => {
    // 获取当前用户信息
    if (user.userUUID === this.userUUID) {
      this.currentUser = user;
    }

    // 获取老师信息
    if (user.userUUID === this.ownerUUID) {
      this.creator = user;
    } else if (user.isSpeak) {
      // 正在连麦的用户
      const index = this.speakingJoiners.findIndex(({ userUUID }) => userUUID === user.userUUID);
      if (index >= 0) {
        this.speakingJoiners.splice(index, 1);
      }
      this.speakingJoiners.push(user);
    } else if (user.isRaiseHand) {
      // 正在举手的用户
      const index = this.handRaisingJoiners.findIndex(({ userUUID }) => userUUID === user.userUUID);
      if (index >= 0) {
        this.handRaisingJoiners.splice(index, 1);
      }
      this.handRaisingJoiners.push(user);
    } else {
      // 其他用户信息
      this.otherJoiners.push(user);
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
        rtcUID: String(users[userUUID].rtcUID),
        avatar: users[userUUID].avatarURL,
        name: users[userUUID].name,
        camera: userUUID === this.userUUID ? preferencesStore.autoCameraOn : false,
        mic: userUUID === this.userUUID ? preferencesStore.autoMicOn : false,
        isSpeak: userUUID === this.userUUID && this.isCreator,
        isRaiseHand: false,
        hasLeft: !this.isInRoom(userUUID),
      }),
    );
  }
}

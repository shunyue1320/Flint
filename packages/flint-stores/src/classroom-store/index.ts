import { useEffect, useState } from "react";
import { SideEffectManager } from "side-effect-manager";
import { action, autorun, makeAutoObservable, observable, reaction, runInAction } from "mobx";

import { Fastboard, Storage } from "@netless/fastboard";
import { RoomType, generateRTCToken } from "@netless/flint-server-api";
import {
  // IServiceRecording,
  IServiceTextChat,
  IServiceVideoChat,
  IServiceVideoChatMode,
  // IServiceVideoChatRole,
  IServiceWhiteboard,
} from "@netless/flint-services";

import { globalStore } from "../global-store";
import { ClassModeType } from "./constants";
import { RoomItem, roomStore } from "../room-store";
import { User, UserStore } from "../user-store";
import { WhiteboardStore } from "../whiteboard-store";
import { preferencesStore } from "../preferences-store";
import { ChatStore } from "./chat-store";

export interface ClassroomStoreConfig {
  roomUUID: string;
  ownerUUID: string;
  rtc: IServiceVideoChat;
  rtm: IServiceTextChat;
  whiteboard: IServiceWhiteboard;
  // recording: IServiceRecording;
}

export type DeviceStateStorageState = Record<string, { camera: boolean; mic: boolean }>;
export type ClassroomStorageState = {
  ban: boolean;
  raiseHandUsers: string[];
  isWritable?: boolean;
};
export type OnStageUsersStorageState = Record<string, boolean>;

export class ClassroomStore {
  private readonly sideEffect = new SideEffectManager();

  public readonly roomUUID: string;
  public readonly ownerUUID: string;
  /** 当前用户的用户uuid */
  public readonly userUUID: string;
  /** 房间等级模式 */
  public classMode: ClassModeType;
  /** 创造者是否禁止发言 */
  public isBan = false;
  /** 正在进行云录制 */
  public isRecording = false;
  /** 正在切换云录制 */
  public isRecordingLoading = false;

  /** RTC加入了房间 */
  public isJoinedRTC = false;

  /** 是当前用户共享屏幕 */
  public isScreenSharing = false;
  /** 其他用户是否共享屏幕 */
  public isRemoteScreenSharing = false;

  public networkQuality = {
    delay: 0,
    uplink: 0,
    downlink: 0,
  };

  public deviceStateStorage?: Storage<DeviceStateStorageState>;
  public classroomStorage?: Storage<ClassroomStorageState>;
  public onStageUsersStorage?: Storage<OnStageUsersStorageState>;

  public readonly users: UserStore;

  public readonly onStageUserUUIDs = observable.array<string>();

  public readonly rtc: IServiceVideoChat;
  public readonly rtm: IServiceTextChat;
  public readonly chatStore: ChatStore;
  public readonly whiteboardStore: WhiteboardStore;
  // public readonly recording: IServiceRecording;

  public constructor(config: ClassroomStoreConfig) {
    if (!globalStore.userUUID) {
      throw new Error("Missing user uuid");
    }

    (window as any).classroomStore = this;

    this.roomUUID = config.roomUUID;
    this.ownerUUID = config.ownerUUID;
    this.userUUID = globalStore.userUUID;
    this.classMode = ClassModeType.Lecture;
    this.rtc = config.rtc;
    this.rtm = config.rtm;
    // this.recording = config.recording;

    this.chatStore = new ChatStore({
      roomUUID: this.roomUUID,
      ownerUUID: this.ownerUUID,
      rtm: this.rtm,
      isShowUserGuide: globalStore.isShowGuide,
    });

    this.users = new UserStore({
      roomUUID: this.roomUUID,
      ownerUUID: this.ownerUUID,
      userUUID: this.userUUID,
      isInRoom: userUUID => this.rtm.members.has(userUUID),
    });

    this.whiteboardStore = new WhiteboardStore({
      isCreator: this.isCreator,
      isWritable: this.isCreator,
      getRoomType: () => this.roomInfo?.roomType || RoomType.BigClass,
      whiteboard: config.whiteboard,
      onDrop: this.onDrop,
    });

    makeAutoObservable<this, "sideEffect">(this, {
      rtc: observable.ref,
      rtm: observable.ref,
      sideEffect: false,
      deviceStateStorage: false,
      // classroomStorage: false,
      onStageUsersStorage: false,
    });
  }

  /** 获取第一个发言用户 */
  public get firstOnStageUser(): User | undefined {
    return this.onStageUserUUIDs.length > 0
      ? this.users.cachedUsers.get(this.onStageUserUUIDs[0])
      : undefined;
  }

  public async init(): Promise<void> {
    // 同步普通客房信息
    await roomStore.syncOrdinaryRoomInfo(this.roomUUID);

    if (process.env.Node_ENV === "development") {
      if (this.roomInfo && this.roomInfo.ownerUUID !== this.ownerUUID) {
        (this.ownerUUID as string) = this.roomInfo.ownerUUID;
        if (process.env.DEV) {
          console.error(new Error("教室错误: ownerUUID 不匹配！"));
        }
      }
    }

    await this.initRTC();

    await this.rtm.joinRoom({
      roomUUID: this.roomUUID,
      ownerUUID: this.ownerUUID,
      uid: this.userUUID,
      token: globalStore.rtmToken,
    });

    // 创建白板室返回到 fastboardAPP https://docs.agora.io/cn/whiteboard/fastboard_api_web?platform=Web#createfastboard
    const fastboard = await this.whiteboardStore.joinWhiteboardRoom();
    await this.users.initUsers([...this.rtm.members]);

    // 同步存储文档：https://www.npmjs.com/package/@netless/synced-store
    // 存储：用户的 { uuid: {相机 录音} } 状态
    const deviceStateStorage = fastboard.syncedStore.connectStorage<DeviceStateStorageState>(
      "deviceState",
      {},
    );
    // 存储：禁言 举手人数
    const classroomStorage = fastboard.syncedStore.connectStorage<ClassroomStorageState>(
      "classroom",
      {
        ban: false,
        raiseHandUsers: [],
      },
    );
    // 存储：正在发言用户 { uuid: true }
    const onStageUsersStorage = fastboard.syncedStore.connectStorage<OnStageUsersStorageState>(
      "onStageUsers",
      {},
    );

    this.deviceStateStorage = deviceStateStorage;
    this.classroomStorage = classroomStorage;
    this.onStageUsersStorage = onStageUsersStorage;
    console.log("更改设备状态=======", deviceStateStorage.state);

    // 创建者默认 相机:false 录音:true 状态设置给本地
    if (this.isCreator) {
      this.updateDeviceState(
        this.userUUID,
        Boolean(preferencesStore.autoCameraOn),
        Boolean(preferencesStore.autoMicOn),
      );
    } else {
      this.whiteboardStore.updateWritable(Boolean(onStageUsersStorage.state[this.userUUID]));
    }

    // 同步禁言状态
    this._updateIsBan(classroomStorage.state.ban);

    // 更新消息列表后更新消息列表缓存
    this.chatStore.onNewMessage = message => {
      if (this.isRecording) {
        fastboard.syncedStore.dispatchEvent("new-message", message);
      }
    };

    this.sideEffect.addDisposer(
      deviceStateStorage.on("stateChanged", () => {
        this.users.updateUsers(user => {
          const deviceState = deviceStateStorage.state[user.userUUID];
          if (deviceState) {
            user.camera = deviceState.camera;
            user.mic = deviceState.mic;
          } else {
            user.mic = false;
            user.camera = false;
          }
        });
      }),
    );
  }

  public get roomInfo(): RoomItem | undefined {
    return roomStore.rooms.get(this.roomUUID);
  }

  public get isCreator(): boolean {
    return this.ownerUUID === this.userUUID;
  }

  /** 当前用户举手时 */
  public onToggleHandRaising = (): void => {
    if (this.isCreator || this.users.currentUser?.isSpeak) {
      return;
    }

    if (this.users.currentUser) {
      void this.rtm.sendPeerCommand(
        "raise-hand",
        { roomUUID: this.roomUUID, raiseHand: !this.users.currentUser.isRaiseHand },
        this.ownerUUID,
      );
    }
  };

  private _updateIsBan(ban: boolean): void {
    this.isBan = ban;
  }

  private async initRTC(): Promise<void> {
    this.sideEffect.addDisposer(
      // 监听网络状态
      this.rtc.events.on(
        "network",
        action("checkNetworkQuality", networkQuality => {
          this.networkQuality = networkQuality;
        }),
      ),
    );

    this.sideEffect.addDisposer(
      // 监听 本地 共享屏幕到远程
      this.rtc.shareScreen.events.on(
        "local-changed",
        action("localShareScreen", enabled => {
          this.isScreenSharing = enabled;
        }),
      ),
    );

    this.sideEffect.addDisposer(
      // 监听 远程 共享屏幕到本地
      this.rtc.shareScreen.events.on(
        "remote-changed",
        action("remoteShareScreen", enabled => {
          this.isRemoteScreenSharing = enabled;
        }),
      ),
    );

    if (globalStore.rtcUID) {
      await this.rtc.joinRoom({
        roomUUID: this.roomUUID,
        uid: String(globalStore.rtcUID),
        token: globalStore.rtcToken,
        mode:
          // 大班广播，小班一对一
          this.roomInfo?.roomType === RoomType.BigClass
            ? IServiceVideoChatMode.Broadcast
            : IServiceVideoChatMode.Communication,
        refreshToken: generateRTCToken,
        shareScreenUID: String(globalStore.rtcShareScreen?.uid || -1),
        shareScreenToken: globalStore.rtcShareScreen?.token || "",
      });

      runInAction(() => {
        this.isJoinedRTC = true;
      });
    }
  }

  /** joiner更新自己的摄像机和麦克风状态 */
  public updateDeviceState = (userUUID: string, camera: boolean, mic: boolean): void => {
    // 只有自己或创建者才能更改设备状态
    if (this.deviceStateStorage?.isWritable && (this.userUUID === userUUID || this.isCreator)) {
      const deviceState = this.deviceStateStorage.state[userUUID];
      if (deviceState) {
        // 创建者可以关闭joiner的相机和麦克风
        // 创建者可以请求joiner打开相机和麦克风
        if (userUUID !== this.userUUID) {
          if (camera && !deviceState.camera) {
            camera = deviceState.camera;
          }

          if (mic && !deviceState.mic) {
            mic = deviceState.mic;
          }
        }
        if (camera === deviceState.camera && mic === deviceState.mic) {
          return;
        }
      }
      console.log("set更改设备状态====", {
        [userUUID]: camera || mic ? { camera, mic } : undefined,
      });
      this.deviceStateStorage.setState({
        [userUUID]: camera || mic ? { camera, mic } : undefined,
      });
    }
  };

  public async destroy(): Promise<void> {
    this.sideEffect.flushAll();

    this.deviceStateStorage = undefined;
    this.classroomStorage = undefined;
  }

  public onDrop = (): void => { };

  public toggleRecording = async ({ onStop }: { onStop?: () => void } = {}): Promise<void> => {
    this.isRecordingLoading = true;
    runInAction(() => {
      this.isRecordingLoading = false;
    });
  };
}

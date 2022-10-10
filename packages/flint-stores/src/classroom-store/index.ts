import { useEffect, useState } from "react";
import { SideEffectManager } from "side-effect-manager";
import { action, autorun, makeAutoObservable, observable, reaction, runInAction } from "mobx";

import type { Storage } from "@netless/fastboard";
import { RoomType, generateRTCToken } from "@netless/flint-server-api";
import {
  // IServiceRecording,
  // IServiceTextChat,
  IServiceVideoChat,
  IServiceVideoChatMode,
  // IServiceVideoChatRole,
  // IServiceWhiteboard,
} from "@netless/flint-services";

import { globalStore } from "../global-store";
import { ClassModeType } from "./constants";
import { RoomItem, roomStore } from "../room-store";
import { UserStore } from "../user-store";
// import { WhiteboardStore } from "../whiteboard-store";

export interface ClassroomStoreConfig {
  roomUUID: string;
  ownerUUID: string;
  rtc: IServiceVideoChat;
  // rtm: IServiceTextChat;
  // whiteboard: IServiceWhiteboard;
  // recording: IServiceRecording;
}

export type DeviceStateStorageState = Record<string, { camera: boolean; mic: boolean }>;
export type ClassroomStorageState = {
  ban: boolean;
  raiseHandUsers: string[];
  isWritable?: boolean;
};

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

  public readonly users: UserStore;

  public readonly rtc: IServiceVideoChat;
  // public readonly rtm: IServiceTextChat;
  // public readonly whiteboardStore: WhiteboardStore;
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
    // this.rtm = config.rtm;
    // this.recording = config.recording;

    // this.chatStore = new ChatStore({
    //   roomUUID: this.roomUUID,
    //   ownerUUID: this.ownerUUID,
    //   rtm: this.rtm,
    //   isShowUserGuide: globalStore.isShowGuide,
    // });

    // this.whiteboardStore = new WhiteboardStore({
    //   isCreator: this.isCreator,
    //   isWritable: this.isCreator,
    //   getRoomType: () => this.roomInfo?.roomType || RoomType.BigClass,
    //   whiteboard: config.whiteboard,
    // });

    makeAutoObservable<this, "sideEffect">(this, {
      rtc: observable.ref,
      // rtm: observable.ref,
      sideEffect: false,
      // deviceStateStorage: false,
      // classroomStorage: false,
      // onStageUsersStorage: false,
    });
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
  }

  public get roomInfo(): RoomItem | undefined {
    return roomStore.rooms.get(this.roomUUID);
  }

  public get isCreator(): boolean {
    return this.ownerUUID === this.userUUID;
  }

  /** 当前用户举手时 */
  public onToggleHandRaising = (): void => {
    if (this.isCreator || this.classroomStorage?.isWritable) {
      this.classroomStorage.setState({ raiseHandUsers: [] });
    }
  };

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
    // 只有创建者才能更改设备状态
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
      this.deviceStateStorage.setState({
        [userUUID]: camera || mic ? { camera, mic } : undefined,
      });
    }
  };

  public async destroy(): Promise<void> {
    this.sideEffect.flushAll();
    this.classroomStorage = undefined;
  }

  public toggleRecording = async ({ onStop }: { onStop?: () => void } = {}): Promise<void> => {
    this.isRecordingLoading = true;
    runInAction(() => {
      this.isRecordingLoading = false;
    });
  };
}

import { useEffect, useState } from "react";
import type { i18n } from "i18next";
import { SideEffectManager } from "side-effect-manager";
import { FlatRTC, FlatRTCRole, FlatRTCMode } from "@netless/flat-rtc";
import { action, autorun, observable, makeAutoObservable, runInAction } from "mobx";

import { RouteNameType, usePushNavigate } from "../utils/routes";
import { errorTips } from "../components/Tips/ErrorTips";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { CloudRecordStartPayload, generateRTCToken } from "../api-middleware/flatServer/agora";
import { ClassModeType } from "../api-middleware/Rtm";
import { getFlatRTC } from "../services/flat-rtc";
import { globalStore } from "./GlobalStore";
import { RtcChannelType } from "../api-middleware/rtc/room";
import { RoomItem, roomStore } from "./room-store";
import { NODE_ENV } from "../constants/process";
import { WhiteboardStore } from "./whiteboard-store";
import { RoomType } from "../api-middleware/flatServer/constants";
import { UserStore } from "./user-store";

export type RecordingConfig = Required<
  CloudRecordStartPayload["agoraData"]["clientRequest"]
>["recordingConfig"];

export class ClassRoomStore {
  private sideEffect = new SideEffectManager();
  public readonly roomUUID: string;
  /** 当前用户的用户uuid */
  public readonly userUUID: string;
  public readonly rtc: FlatRTC;
  /** 云记录是否打开 */
  public isRecording = false;
  /** RTC UI是否打开 */
  public isCalling = false;
  /** 是否RTC连接教室 */
  public isJoinedRTC = false;

  public isCloudStoragePanelVisible = false;

  /** 是当前用户共享屏幕 */
  public isScreenSharing = false;
  /** 其他用户是否共享屏幕 */
  public isRemoteScreenSharing = false;

  public networkQuality = {
    delay: 0,
    uplink: 0,
    downlink: 0,
  };

  public readonly users: UserStore;

  public readonly whiteboardStore: WhiteboardStore;

  // 此OwnerUID来自不可信任的url参数匹配
  private readonly ownerUUIDFromParams: string;

  private readonly recordingConfig: RecordingConfig;

  private _noMoreRemoteMessages = false;

  private _collectChannelStatusTimeout?: number;

  /** 暂停类之前保留创建者状态 */
  private _userDeviceStatePrePause?: { mic: boolean; camera: boolean } | null;

  public constructor(config: {
    roomUUID: string;
    ownerUUID: string;
    recordingConfig: RecordingConfig;
    classMode?: ClassModeType;
    i18n: i18n;
  }) {
    if (!globalStore.userUUID) {
      throw new Error("Missing user uuid");
    }

    this.roomUUID = config.roomUUID;
    this.ownerUUIDFromParams = config.ownerUUID;
    this.userUUID = globalStore.userUUID;
    this.recordingConfig = config.recordingConfig;

    this.rtc = getFlatRTC();

    makeAutoObservable<
      this,
      "_noMoreRemoteMessages" | "_collectChannelStatusTimeout" | "_userDeviceStatePrePause"
    >(this, {
      rtc: observable.ref,
      _noMoreRemoteMessages: false,
      _collectChannelStatusTimeout: false,
      _userDeviceStatePrePause: false,
    });

    this.users = new UserStore({
      roomUUID: this.roomUUID,
      ownerUUID: this.ownerUUID,
      userUUID: this.userUUID,
    });

    this.whiteboardStore = new WhiteboardStore({
      isCreator: this.isCreator,
      getRoomType: () => this.roomInfo?.roomType || RoomType.BigClass,
      i18n: config.i18n,
      onDrop: this.onDrop,
    });
  }

  public onDrop = (file: File): void => {
    this.toggleCloudStoragePanel(true);
    const cloudStorage = this.whiteboardStore.cloudStorageStore;
  };

  public toggleRecording = async ({ onStop }: { onStop?: () => void } = {}): Promise<void> => {
    try {
      if (this.isRecording) {
        await this.stopRecording();
        onStop?.();
      } else {
        await this.startRecording();
      }
    } catch (e) {
      errorTips(e as Error);
    }
  };

  private async stopRecording(): Promise<void> {
    runInAction(() => {
      this.isRecording = false;
    });
  }

  private async startRecording(): Promise<void> {
    runInAction(() => {
      this.isRecording = true;
    });
  }

  public toggleShareScreen = (force = !this.isScreenSharing): void => {
    // this.rtc.shareScreen.enable(force);
  };

  public toggleCloudStoragePanel = (visible: boolean): void => {
    this.isCloudStoragePanelVisible = visible;
  };

  public joinRTC = async (): Promise<void> => {
    if (this.isCalling || globalStore.rtcUID === null || globalStore.rtcUID === void 0) {
      return;
    }

    try {
      await this.rtc.joinRoom({
        // 房间id
        roomUUID: this.roomUUID,
        // rtc id
        uid: globalStore.rtcUID,
        // 设置加入房间的角色
        role: this.isCreator ? FlatRTCRole.Host : FlatRTCRole.Audience,
        // 请求获取的 token
        token: globalStore.rtcToken,
        // 模式：广播(大班面向海量学生) ｜ 表达
        mode:
          this.recordingConfig.channelType === RtcChannelType.Broadcast
            ? FlatRTCMode.Broadcast
            : FlatRTCMode.Communication,
        // 刷新 token 方法
        refreshToken: generateRTCToken,
        // 共享屏幕 id
        shareScreenUID: globalStore.rtcShareScreen?.uid || -1,
        // 共享屏幕 token
        shareScreenToken: globalStore.rtcShareScreen?.token || "",
      });
      this.updateIsJoinedRTC(true);
    } catch (e) {
      console.error(e);
      this.updateCalling(false);
    }
  };

  private updateCalling = action("updateCalling", (isCalling: boolean): void => {
    this.isCalling = isCalling;
  });

  private updateIsJoinedRTC = action("updateIsJoinedRTC", (isJoinedRTC: boolean): void => {
    this.isJoinedRTC = isJoinedRTC;
  });

  // 房间是不是自己创建的
  public get isCreator(): boolean {
    return this.ownerUUID === this.userUUID;
  }

  public get ownerUUID(): string {
    if (this.roomInfo) {
      if (NODE_ENV === "development") {
        // 不等于来自参数的所有者UUID
        if (this.roomInfo.ownerUUID !== this.ownerUUIDFromParams) {
          throw new Error("ClassRoom Error: ownerUUID mismatch!");
        }
      }
      return this.roomInfo.ownerUUID;
    }
    return this.ownerUUIDFromParams;
  }

  // 去 roomStore 该查出房间的详细信息
  public get roomInfo(): RoomItem | undefined {
    return roomStore.rooms.get(this.roomUUID);
  }

  public async init(): Promise<void> {
    await this.joinRTC();

    this.sideEffect.addDisposer(
      this.rtc.events.on(
        "network",
        action("checkNetworkQuality", networkQuality => {
          this.networkQuality = networkQuality;
        }),
      ),
    );
  }

  /** 当当、前用户（加入者）举手时 */
  public onToggleHandRaising = (): void => {
    return;
  };

  public async destroy(): Promise<void> { }
}

export interface ClassRoomStoreConfig {
  roomUUID: string;
  ownerUUID: string;
  recordingConfig: RecordingConfig;
  classMode?: ClassModeType;
  i18n: i18n;
}

export function useClassRoomStore({
  roomUUID,
  ownerUUID,
  recordingConfig,
  classMode,
  i18n,
}: ClassRoomStoreConfig): ClassRoomStore {
  const [classRoomStore] = useState(
    () =>
      new ClassRoomStore({
        roomUUID,
        ownerUUID,
        recordingConfig,
        classMode,
        i18n,
      }),
  );

  const pushNavigate = usePushNavigate();
  const sp = useSafePromise();

  useEffect(() => {
    sp(classRoomStore.init()).catch(e => {
      errorTips(e);
      pushNavigate(RouteNameType.HomePage);
    });

    return () => {
      void classRoomStore.destroy();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return classRoomStore;
}

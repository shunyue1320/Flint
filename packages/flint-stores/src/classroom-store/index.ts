import { useEffect, useState } from "react";
import { SideEffectManager } from "side-effect-manager";
import { action, autorun, makeAutoObservable, observable, reaction, runInAction } from "mobx";

import type { Storage } from "@netless/fastboard";
import { RoomType } from "@netless/flint-server-api";
import {
  // IServiceRecording,
  // IServiceTextChat,
  IServiceVideoChat,
  // IServiceVideoChatMode,
  // IServiceVideoChatRole,
  // IServiceWhiteboard,
} from "@netless/flint-services";

import { globalStore } from "../global-store";
import { ClassModeType } from "./constants";
import { RoomItem, roomStore } from "../room-store";
import { UserStore } from "../user-store";

export interface ClassroomStoreConfig {
  roomUUID: string;
  ownerUUID: string;
  rtc: IServiceVideoChat;
  // rtm: IServiceTextChat;
  // whiteboard: IServiceWhiteboard;
  // recording: IServiceRecording;
}

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

  public classroomStorage?: Storage<ClassroomStorageState>;

  public readonly users: UserStore;

  public readonly rtc: IServiceVideoChat;
  // public readonly rtm: IServiceTextChat;
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

    makeAutoObservable<this, "sideEffect">(this, {
      rtc: observable.ref,
      // rtm: observable.ref,
      sideEffect: false,
      // deviceStateStorage: false,
      // classroomStorage: false,
      // onStageUsersStorage: false,
    });
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
}

// import { useEffect, useState } from "react";
// import type { i18n } from "i18next";
// // import dateSub from "date-fns/sub";
// // import { v4 as uuidv4 } from "uuid";
// import { SideEffectManager } from "side-effect-manager";
// // import { FlatRTC, FlatRTCRole, FlatRTCMode } from "@netless/flat-rtc";
// import { action, autorun, observable, makeAutoObservable, runInAction } from "mobx";

// import { RouteNameType, usePushNavigate } from "../utils/routes";
// import { errorTips } from "../components/Tips/ErrorTips";
// import { useSafePromise } from "../utils/hooks/lifecycle";
// import {
//   CloudRecordStartPayload,
//   generateRTCToken,
//   checkRTMCensor,
// } from "../api-middleware/flatServer/agora";
// import { ClassModeType } from "../api-middleware/Rtm";
// import { getFlatRTC } from "../services/flat-rtc";
// import { globalStore } from "../global-store";
// import { RtcChannelType } from "../api-middleware/rtc/room";
// import { Rtm as RTMAPI, RTMessage, RTMessageType } from "../api-middleware/Rtm";
// import { RoomItem, roomStore } from "../room-store";
// import { NODE_ENV } from "../constants/process";
// import { WhiteboardStore } from "../whiteboard-store";
// import { RoomType } from "../api-middleware/flatServer/constants";
// import { NEED_CHECK_CENSOR } from "../constants/config";
// import { UserStore } from "../user-store";

// export type { User } from "../user-store";

// export type RTMChannelMessage = RTMessage<
//   | RTMessageType.ChannelMessage
//   | RTMessageType.Notice
//   | RTMessageType.BanText
//   | RTMessageType.UserGuide
// >;

// export type RecordingConfig = Required<
//   CloudRecordStartPayload["agoraData"]["clientRequest"]
// >["recordingConfig"];

// export class ClassRoomStore {
//   private sideEffect = new SideEffectManager();
//   public readonly roomUUID: string;
//   /** 当前用户的用户uuid */
//   public readonly userUUID: string;
//   /** RTM 消息列表 */
//   public messages = observable.array<RTMChannelMessage>([]);
//   public readonly rtc: FlatRTC;
//   public readonly rtm: RTMAPI;
//   /** 创造者是否禁止发言 */
//   public isBan = false;
//   /** 云记录是否打开 */
//   public isRecording = false;
//   /** RTC UI是否打开 */
//   public isCalling = false;
//   /** 是否RTC连接教室 */
//   public isJoinedRTC = false;

//   public isCloudStoragePanelVisible = false;

//   /** 是当前用户共享屏幕 */
//   public isScreenSharing = false;
//   /** 其他用户是否共享屏幕 */
//   public isRemoteScreenSharing = false;

//   public networkQuality = {
//     delay: 0,
//     uplink: 0,
//     downlink: 0,
//   };

//   public readonly users: UserStore;

//   public readonly whiteboardStore: WhiteboardStore;

//   // 此OwnerUID来自不可信任的url参数匹配
//   private readonly ownerUUIDFromParams: string;

//   private readonly recordingConfig: RecordingConfig;

//   private _noMoreRemoteMessages = false;

//   private _collectChannelStatusTimeout?: number;

//   /** 暂停类之前保留创建者状态 */
//   private _userDeviceStatePrePause?: { mic: boolean; camera: boolean } | null;

//   public constructor(config: {
//     roomUUID: string;
//     ownerUUID: string;
//     recordingConfig: RecordingConfig;
//     classMode?: ClassModeType;
//     i18n: i18n;
//   }) {
//     if (!globalStore.userUUID) {
//       throw new Error("Missing user uuid");
//     }

//     this.roomUUID = config.roomUUID;
//     this.ownerUUIDFromParams = config.ownerUUID;
//     this.userUUID = globalStore.userUUID;
//     this.recordingConfig = config.recordingConfig;

//     this.rtc = getFlatRTC();
//     this.rtm = new RTMAPI();

//     makeAutoObservable<
//       this,
//       "_noMoreRemoteMessages" | "_collectChannelStatusTimeout" | "_userDeviceStatePrePause"
//     >(this, {
//       rtc: observable.ref,
//       _noMoreRemoteMessages: false,
//       _collectChannelStatusTimeout: false,
//       _userDeviceStatePrePause: false,
//     });

//     this.users = new UserStore({
//       roomUUID: this.roomUUID,
//       ownerUUID: this.ownerUUID,
//       userUUID: this.userUUID,
//     });

//     this.whiteboardStore = new WhiteboardStore({
//       isCreator: this.isCreator,
//       getRoomType: () => this.roomInfo?.roomType || RoomType.BigClass,
//       i18n: config.i18n,
//       onDrop: this.onDrop,
//     });

//     console.log("this.whiteboardStore=======", this.whiteboardStore);
//   }

//   public onDrop = (file: File): void => {
//     this.toggleCloudStoragePanel(true);
//     const cloudStorage = this.whiteboardStore.cloudStorageStore;
//   };

//   public toggleRecording = async ({ onStop }: { onStop?: () => void } = {}): Promise<void> => {
//     try {
//       if (this.isRecording) {
//         await this.stopRecording();
//         onStop?.();
//       } else {
//         await this.startRecording();
//       }
//     } catch (e) {
//       errorTips(e as Error);
//     }
//   };

//   private async stopRecording(): Promise<void> {
//     runInAction(() => {
//       this.isRecording = false;
//     });
//   }

//   private async startRecording(): Promise<void> {
//     runInAction(() => {
//       this.isRecording = true;
//     });
//   }

//   public toggleShareScreen = (force = !this.isScreenSharing): void => {
//     // this.rtc.shareScreen.enable(force);
//   };

//   public toggleCloudStoragePanel = (visible: boolean): void => {
//     this.isCloudStoragePanelVisible = visible;
//   };

//   public joinRTC = async (): Promise<void> => {
//     if (this.isCalling || globalStore.rtcUID === null || globalStore.rtcUID === void 0) {
//       return;
//     }

//     try {
//       await this.rtc.joinRoom({
//         // 房间id
//         roomUUID: this.roomUUID,
//         // rtc id
//         uid: globalStore.rtcUID,
//         // 设置加入房间的角色
//         role: this.isCreator ? FlatRTCRole.Host : FlatRTCRole.Audience,
//         // 请求获取的 token
//         token: globalStore.rtcToken,
//         // 模式：广播(大班面向海量学生) ｜ 表达
//         mode:
//           this.recordingConfig.channelType === RtcChannelType.Broadcast
//             ? FlatRTCMode.Broadcast
//             : FlatRTCMode.Communication,
//         // 刷新 token 方法
//         refreshToken: generateRTCToken,
//         // 共享屏幕 id
//         shareScreenUID: globalStore.rtcShareScreen?.uid || -1,
//         // 共享屏幕 token
//         shareScreenToken: globalStore.rtcShareScreen?.token || "",
//       });
//       this.updateIsJoinedRTC(true);
//     } catch (e) {
//       console.error(e);
//       this.updateCalling(false);
//     }
//   };

//   private updateCalling = action("updateCalling", (isCalling: boolean): void => {
//     this.isCalling = isCalling;
//   });

//   private updateIsJoinedRTC = action("updateIsJoinedRTC", (isJoinedRTC: boolean): void => {
//     this.isJoinedRTC = isJoinedRTC;
//   });

//   // 房间是不是自己创建的
//   public get isCreator(): boolean {
//     return this.ownerUUID === this.userUUID;
//   }

//   public get ownerUUID(): string {
//     if (this.roomInfo) {
//       if (NODE_ENV === "development") {
//         // 不等于来自参数的所有者UUID
//         if (this.roomInfo.ownerUUID !== this.ownerUUIDFromParams) {
//           throw new Error("ClassRoom Error: ownerUUID mismatch!");
//         }
//       }
//       return this.roomInfo.ownerUUID;
//     }
//     return this.ownerUUIDFromParams;
//   }

//   // 去 roomStore 该查出房间的详细信息
//   public get roomInfo(): RoomItem | undefined {
//     return roomStore.rooms.get(this.roomUUID);
//   }

//   public async init(): Promise<void> {
//     const channel = await this.rtm.init(this.userUUID, this.roomUUID);
//     // 监听消息
//     this.startListenCommands();

//     const members = await channel.getMembers();
//     await this.users.initUsers(members);

//     await this.joinRTC();
//     // 更新房间历史消息
//     await this.updateHistory();

//     await this.whiteboardStore.joinWhiteboardRoom();

//     this.sideEffect.addDisposer(
//       this.rtc.events.on(
//         "network",
//         action("checkNetworkQuality", networkQuality => {
//           this.networkQuality = networkQuality;
//         }),
//       ),
//     );
//   }

//   public startListenCommands = (): void => {
//     this.rtm.on(RTMessageType.ChannelMessage, (text, senderId) => {
//       // 没有禁止发言 或者 是老师发言
//       if (!this.isBan || senderId === this.ownerUUID) {
//         this.addMessage(RTMessageType.ChannelMessage, text, senderId);
//         // 缓存里没有该用户
//         if (!this.users.cachedUsers.has(senderId)) {
//           // this.users.syncExtraUsersInfo([senderId]).catch(console.warn);
//         }
//       }
//     });
//   };

//   private addMessage = (
//     type: RTMessageType.ChannelMessage | RTMessageType.Notice | RTMessageType.BanText,
//     value: string | boolean,
//     senderID: string,
//   ): void => {
//     const timestamp = Date.now();
//     let insertPoint = 0;

//     // 将获取的消息插入到消息列表对应的位置
//     while (
//       insertPoint < this.messages.length &&
//       this.messages[insertPoint].timestamp <= timestamp
//     ) {
//       insertPoint++;
//     }

//     this.messages.splice(insertPoint, 0, {
//       type,
//       uuid: uuidv4(),
//       timestamp,
//       value,
//       userUUID: senderID,
//     });
//   };

//   public updateHistory = async (): Promise<void> => {
//     let messages: RTMessage[] = [];

//     try {
//       // 取第一条条消息的时间戳，没有就取当前时间
//       const oldestTimestamp = this.messages.length > 0 ? this.messages[0].timestamp : Date.now();
//       // 获取当前时间往前一年前的消息
//       messages = await this.rtm.fetchTextHistory(
//         dateSub(oldestTimestamp, { years: 1 }).valueOf(),
//         oldestTimestamp - 1,
//       );
//     } catch (e) {
//       console.warn(e);
//     }

//     if (messages.length <= 0) {
//       this._noMoreRemoteMessages = true;
//       return;
//     }

//     const textMessages = messages.filter(
//       (message): message is RTMChannelMessage =>
//         message.type === RTMessageType.ChannelMessage || message.type === RTMessageType.Notice,
//     );

//     // 触发响应式
//     runInAction(() => {
//       this.messages.unshift(...textMessages);
//       console.log("messages ======", this.messages);
//     });
//   };

//   /** 更新自己的摄像头和麦克风状态 */
//   public updateDeviceState = (userUUID: string, camera: boolean, mic: boolean): void => {
//     if (this.userUUID === userUUID || this.isCreator) {
//       this.users.updateUsers(user => {
//         if (user.userUUID === userUUID) {
//           // 创建者可以关闭用户的相机和麦克风，不能擅自打开
//           if (this.userUUID !== userUUID) {
//             if (camera && !user.camera) {
//               camera = user.camera;
//             }

//             if (mic && !user.mic) {
//               mic = user.mic;
//             }
//           }

//           if (camera !== user.camera || mic !== user.mic) {
//             user.isRaiseHand = false;
//             user.camera = camera;
//             user.mic = mic;
//             return false;
//           }
//         }

//         return true;
//       });
//       void this.rtm.sendCommand({
//         type: RTMessageType.DeviceState,
//         value: { userUUID, camera, mic },
//         keepHistory: true,
//       });
//     }
//   };

//   /** 当前用户（加入者）举手时 */
//   public onToggleHandRaising = (): void => {
//     return;
//   };

//   public onMessageSend = async (text: string): Promise<void> => {
//     if (this.isBan && !this.isCreator) {
//       return;
//     }

//     if (NEED_CHECK_CENSOR && !(await checkRTMCensor({ text })).valid) {
//       return;
//     }

//     await this.rtm.sendMessage(text);
//     // 自己发言不会推送给自己
//     this.addMessage(RTMessageType.ChannelMessage, text, this.userUUID);
//   };

//   public async destroy(): Promise<void> { }
// }

// export interface ClassRoomStoreConfig {
//   roomUUID: string;
//   ownerUUID: string;
//   recordingConfig: RecordingConfig;
//   classMode?: ClassModeType;
//   i18n: i18n;
// }

// export function useClassRoomStore({
//   roomUUID,
//   ownerUUID,
//   recordingConfig,
//   classMode,
//   i18n,
// }: ClassRoomStoreConfig): ClassRoomStore {
//   // 使用 useState 保留状态，组件刷新就不会再次 new ClassRoomStore
//   const [classRoomStore] = useState(
//     () =>
//       new ClassRoomStore({
//         roomUUID,
//         ownerUUID,
//         recordingConfig,
//         classMode,
//         i18n,
//       }),
//   );

//   const pushNavigate = usePushNavigate();
//   const sp = useSafePromise();

//   useEffect(() => {
//     sp(classRoomStore.init()).catch(e => {
//       errorTips(e);
//       pushNavigate(RouteNameType.HomePage);
//     });

//     return () => {
//       void classRoomStore.destroy();
//     };

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return classRoomStore;
// }

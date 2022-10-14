import AgoraRTC, {
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCClient,
  NetworkQuality,
} from "agora-rtc-sdk-ng";
import { SideEffectManager } from "side-effect-manager";

import {
  IServiceVideoChat,
  IServiceVideoChatAvatar,
  IServiceVideoChatDevice,
  IServiceVideoChatRole,
  IServiceVideoChatMode,
  IServiceVideoChatJoinRoomConfig,
  IServiceVideoChatUID,
} from "@netless/flint-services";

import { AgoraRTCWebShareScreen } from "./rtc-share-screen";
import { RTCLocalAvatar } from "./rtc-local-avatar";
import { RTCRemoteAvatar } from "./rtc-remote-avatar";

if (process.env.PROD) {
  AgoraRTC.setLogLevel(/* WARNING */ 2);
}

if (process.env.DEV) {
  (window as any).AgoraRTC = AgoraRTC;
}

export interface AgoraRTCWebConfig {
  APP_ID: string;
}

export class AgoraRTCWeb extends IServiceVideoChat {
  public readonly APP_ID: string;
  public readonly shareScreen: AgoraRTCWebShareScreen;

  private readonly _roomSideEffect = new SideEffectManager();

  // 加入教室
  private _pJoiningRoom?: Promise<unknown>;
  // 离开教室
  private _pLeavingRoom?: Promise<unknown>;

  public client?: IAgoraRTCClient;
  public mode?: IServiceVideoChatMode;

  private _cameraID?: string;
  private _micID?: string;
  private _speakerID?: string;

  private uid?: IServiceVideoChatUID;
  private roomUUID?: string;
  private shareScreenUID?: IServiceVideoChatUID;

  private _remoteAvatars = new Map<IServiceVideoChatUID, RTCRemoteAvatar>();
  public get remoteAvatars(): IServiceVideoChatAvatar[] {
    return [...this._remoteAvatars.values()];
  }

  private _localAvatar?: RTCLocalAvatar;
  public get localAvatar(): IServiceVideoChatAvatar {
    return (this._localAvatar ??= new RTCLocalAvatar({ rtc: this }));
  }

  public get isJoinedRoom(): boolean {
    return Boolean(this.roomUUID);
  }

  public constructor({ APP_ID }: AgoraRTCWebConfig) {
    super();
    this.APP_ID = APP_ID;
    // 创建 AgoraRTC 客户端 client
    this.shareScreen = new AgoraRTCWebShareScreen({ APP_ID });
    this.sideEffect.add(() => {
      // 监听 摄像头 改变并更新id
      AgoraRTC.onCameraChanged = deviceInfo => {
        this.setCameraID(deviceInfo.device.deviceId);
      };
      // 监听 麦克风 改变并更新id
      AgoraRTC.onMicrophoneChanged = deviceInfo => {
        this.setMicID(deviceInfo.device.deviceId);
      };
      // 监听 扬声器 改变并更新id
      AgoraRTC.onPlaybackDeviceChanged = deviceInfo => {
        this.setSpeakerID(deviceInfo.device.deviceId);
      };

      // 卸载时销毁副作用
      return () => {
        AgoraRTC.onCameraChanged = undefined;
        AgoraRTC.onMicrophoneChanged = undefined;
        AgoraRTC.onPlaybackDeviceChanged = undefined;
      };
    });
  }

  public override async destroy(): Promise<void> {
    super.destroy();
    this.shareScreen.destroy();
    // await this.leaveRoom()
  }

  public getAvatar(uid: IServiceVideoChatUID): IServiceVideoChatAvatar | undefined {
    if (!this.isJoinedRoom) {
      return;
    }
    if (!uid || this.uid === uid) {
      return this.localAvatar;
    }
    if (this.shareScreenUID === uid) {
      throw new Error("不支持 getAvatar(shareScreenUID)。");
    }

    let remoteAvatar = this._remoteAvatars.get(uid);
    console.log("this.client?.remoteUsers==1==", this.client?.remoteUsers);

    // 如果没有就去 client.remoteUsers 找到该用户并设置到 _remoteAvatars 数组中
    if (!remoteAvatar) {
      const rtcRemoteUser = this.client?.remoteUsers.find(user => user.uid === uid);
      remoteAvatar = new RTCRemoteAvatar({ rtcRemoteUser });
      this._remoteAvatars.set(uid, remoteAvatar);
    }
    console.log("remoteAvatar====", remoteAvatar);
    return remoteAvatar;
  }

  public async joinRoom(config: IServiceVideoChatJoinRoomConfig): Promise<void> {
    if (!this.APP_ID) {
      throw new Error("未设置APP_ID");
    }

    // 正在连接教室
    if (this._pJoiningRoom) {
      await this._pJoiningRoom;
    }
    // 正在离开教室
    if (this._pLeavingRoom) {
      await this._pLeavingRoom;
    }

    // 当前已经加入房间就退出上个房间（避免同时多次加入房间）
    if (this.client) {
      if (this.roomUUID === config.roomUUID) {
        return;
      }
      await this.leaveRoom();
    }

    this._pLeavingRoom = this._createRTCClient(config);
    await this._pJoiningRoom;
    this._pJoiningRoom = undefined;
  }

  public async leaveRoom(): Promise<void> {
    // 正在连接教室
    if (this._pJoiningRoom) {
      await this._pJoiningRoom;
    }
    // 正在离开教室
    if (this._pLeavingRoom) {
      await this._pLeavingRoom;
    }

    if (this.client) {
      try {
        this._roomSideEffect.flushAll();
      } catch (e) {
        // 忽略
      }

      this._pLeavingRoom = this.client.leave();
      await this._pLeavingRoom;
      this._pLeavingRoom = undefined;
      this.client = undefined;
      if (process.env.DEV) {
        (window as any).rtc_client = undefined;
      }
      this.mode = undefined;
    }

    this.uid = undefined;
    this.roomUUID = undefined;
    // this.shareScreen.setParams(null);
  }

  private async _createRTCClient({
    uid,
    token,
    mode,
    refreshToken,
    role,
    roomUUID,
    shareScreenUID,
    shareScreenToken,
  }: IServiceVideoChatJoinRoomConfig): Promise<void> {
    // 先清除房间的副作用
    this._roomSideEffect.flushAll();

    const client = AgoraRTC.createClient({
      mode: mode === IServiceVideoChatMode.Broadcast ? "live" : "rtc",
      codec: "h264",
    });
    this.client = client;
    this.mode = mode;
    if (process.env.DEV) {
      (window as any).rtc_client = client;
    }

    // 设置当前用户角色
    if (mode === IServiceVideoChatMode.Broadcast) {
      await client.setClientRole(role === IServiceVideoChatRole.Host ? "host" : "audience");
    }

    // if (refreshToken) {
    // }

    // 开发模式下的 客户端例外日子收集
    if (process.env.NODE_ENV === "development") {
      this._roomSideEffect.add(() => {
        const handler = (exception: any): void => {
          console.log(exception);
        };
        client.on("exception", handler);
        return () => client.off("exception", handler);
      });
    }

    this._roomSideEffect.addDisposer(
      this.events.remit("network", () => {
        const handler = ({
          uplinkNetworkQuality,
          downlinkNetworkQuality,
        }: NetworkQuality): void => {
          this.events.emit("network", {
            uplink: uplinkNetworkQuality,
            downlink: downlinkNetworkQuality,
            delay: client.getRTCStats().RTT ?? NaN,
          });
        };
        client.on("network-quality", handler);
        return () => client.off("network-quality", handler);
      }),
    );

    //  rtc 客户端加入房间
    await client.join(
      this.APP_ID,
      roomUUID,
      token || (await refreshToken?.(roomUUID)) || null,
      Number(uid),
    );

    this.uid = uid;
    this.roomUUID = roomUUID;
    // this.shareScreenUID = shareScreenUID;
    // this.shareScreen.setParams({
    //   roomUUID,
    //   token: shareScreenToken,
    //   uid: shareScreenUID,
    // });
  }

  public async setRole(role: IServiceVideoChatRole): Promise<void> {
    // 状态是广播才需要设置角色
    if (this.client && this.mode === IServiceVideoChatMode.Broadcast) {
      await this.client.setClientRole(role);
    }
  }

  public getCameraID(): string | undefined {
    return this._cameraID;
  }
  public async setCameraID(deviceId: string): Promise<void> {
    if (this._cameraID !== deviceId) {
      if (this.localCameraTrack) {
        await this.localCameraTrack.setDevice(deviceId);
      }
      this._cameraID = deviceId;
      this.events.emit("camera-changed", deviceId);
    }
  }

  public getMicID(): string | undefined {
    return this._micID;
  }
  public async setMicID(deviceId: string): Promise<void> {
    if (this._micID !== deviceId) {
      if (this.localMicTrack) {
        await this.localMicTrack.setDevice(deviceId);
      }
      this._micID = deviceId;
      this.events.emit("mic-changed", deviceId);
    }
  }

  /** 获取所有 摄像机 设备id */
  public async getCameraDevices(): Promise<IServiceVideoChatDevice[]> {
    return (await AgoraRTC.getCameras()).map(device => ({
      deviceId: device.deviceId,
      label: device.label,
    }));
  }

  /** 获取所有 麦克风 设备id */
  public async getMicDevices(): Promise<IServiceVideoChatDevice[]> {
    return (await AgoraRTC.getMicrophones()).map(device => ({
      deviceId: device.deviceId,
      label: device.label,
    }));
  }

  /** 获取所有 扬声器 设备id */
  public async getSpeakerDevices(): Promise<IServiceVideoChatDevice[]> {
    return (await AgoraRTC.getPlaybackDevices()).map(device => ({
      deviceId: device.deviceId,
      label: device.label,
    }));
  }

  public getTestAvatar(): IServiceVideoChatAvatar {
    return this.localAvatar;
  }

  // 本地摄像机轨迹 ｜ 创建
  public localCameraTrack?: ICameraVideoTrack;
  public createLocalCameraTrack = singleRun(async (): Promise<ICameraVideoTrack> => {
    if (!this.localCameraTrack) {
      this.localCameraTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: { width: 288, height: 216 },
        cameraId: this._cameraID,
      });

      // if (this._pJoiningRoom) {
      //   await this._pJoiningRoom;
      // }
    }
    return this.localCameraTrack;
  });

  // 本地麦克风轨迹 ｜ 创建
  public localMicTrack?: IMicrophoneAudioTrack;
  public createLocalMicTrack = singleRun(async (): Promise<IMicrophoneAudioTrack> => {
    if (!this.localMicTrack) {
      this.localMicTrack = await AgoraRTC.createMicrophoneAudioTrack({
        microphoneId: this._micID,
        // 声回波消除
        AEC: true,
        // 自动噪声抑制
        ANS: true,
      });

      // if (this._pJoiningRoom) {
      //   await this._pJoiningRoom;
      // }
    }
    return this.localMicTrack;
  });
}

/** singleRun 返回的函数只能同时存在一个 run 运行状态 */
function singleRun<TFn extends (...args: any[]) => Promise<any>>(fn: TFn): TFn {
  let p: any;
  const run = ((...args) => {
    if (!p) {
      p = fn(...args);
      p.then(() => (p = undefined));
    }
    return p;
  }) as TFn;
  return run;
}

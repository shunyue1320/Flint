import AgoraRTC, {
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCClient,
} from "agora-rtc-sdk-ng";

import {
  IServiceVideoChat,
  IServiceVideoChatAvatar,
  IServiceVideoChatDevice,
  IServiceVideoChatRole,
  IServiceVideoChatMode,
} from "@netless/flint-services";

import { AgoraRTCWebShareScreen } from "./rtc-share-screen";
import { RTCLocalAvatar } from "./rtc-local-avatar";

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

  // 加入教室
  private _pJoiningRoom?: Promise<unknown>;
  // 离开教室
  private _pLeavingRoom?: Promise<unknown>;

  public client?: IAgoraRTCClient;
  public mode?: IServiceVideoChatMode;

  private _cameraID?: string;
  private _micID?: string;
  private _speakerID?: string;

  private _localAvatar?: RTCLocalAvatar;
  public get localAvatar(): IServiceVideoChatAvatar {
    return (this._localAvatar ??= new RTCLocalAvatar({ rtc: this }));
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

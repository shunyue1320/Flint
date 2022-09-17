import AgoraRTC from "agora-rtc-sdk-ng";

import { IServiceVideoChat, IServiceVideoChatAvatar } from "@netless/flint-services";

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

  public getTestAvatar(): IServiceVideoChatAvatar {
    return this.localAvatar;
  }
}

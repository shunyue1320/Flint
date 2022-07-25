import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  NetworkQuality,
} from "agora-rtc-sdk-ng";
import {
  FlatRTC,
  FlatRTCAvatar,
  FlatRTCDevice,
  FlatRTCEventData,
  FlatRTCEventNames,
  FlatRTCJoinRoomConfigBase,
  FlatRTCMode,
  FlatRTCRole,
} from "@netless/flat-rtc";
import { RTCLocalAvatar } from "./rtc-local-avatar";
import { SideEffectManager } from "side-effect-manager";

AgoraRTC.enableLogUpload();

if (process.env.PROD) {
  AgoraRTC.setLogLevel(/* WARNING */ 2);
}

if (process.env.DEV) {
  (window as any).AgoraRTC = AgoraRTC;
}

export type FlatRTCAgoraWebUIDType = number;
export type FlatRTCAgoraWebJoinRoomConfig = FlatRTCJoinRoomConfigBase<FlatRTCAgoraWebUIDType>;

export interface FlatRTCAgoraWebConfig {
  APP_ID: string;
}

export type IFlatRTCAgoraWeb = FlatRTC<FlatRTCAgoraWebUIDType, FlatRTCAgoraWebJoinRoomConfig>;

export class FlatRTCAgoraWeb extends FlatRTC<FlatRTCAgoraWebUIDType> {
  public static APP_ID: string;

  private _localAvatar?: RTCLocalAvatar;

  private static _instance?: FlatRTCAgoraWeb;

  private readonly _sideEffect = new SideEffectManager();

  private _cameraID?: string;
  private _micID?: string;
  private _speakerID?: string;

  private constructor() {
    super();
    this._sideEffect.add(() => {
      // 摄像机更改
      AgoraRTC.onCameraChanged = deviceInfo => {
        this.setCameraID(deviceInfo.device.deviceId);
      };
      // 麦克风更改
      AgoraRTC.onMicrophoneChanged = deviceInfo => {
        this.setMicID(deviceInfo.device.deviceId);
      };
      // 扬声器更改
      AgoraRTC.onPlaybackDeviceChanged = deviceInfo => {
        this.setSpeakerID(deviceInfo.device.deviceId);
      };

      return () => {
        AgoraRTC.onCameraChanged = undefined;
        AgoraRTC.onMicrophoneChanged = undefined;
        AgoraRTC.onPlaybackDeviceChanged = undefined;
      };
    });
  }

  public async setCameraID(deviceId: string): Promise<void> {
    if (this._cameraID !== deviceId) {
      this._cameraID = deviceId;
      this.events.emit("camera-changed", deviceId);
    }
  }

  public async setMicID(deviceId: string): Promise<void> {
    if (this._micID !== deviceId) {
      this._micID = deviceId;
      this.events.emit("mic-changed", deviceId);
    }
  }

  public async setSpeakerID(deviceId: string): Promise<void> {
    if (this._speakerID !== deviceId) {
      this._speakerID = deviceId;
      this.events.emit("speaker-changed", deviceId);
    }
  }

  public static getInstance(): FlatRTCAgoraWeb {
    return (FlatRTCAgoraWeb._instance ??= new FlatRTCAgoraWeb());
  }

  public get localAvatar(): FlatRTCAvatar {
    return (this._localAvatar ??= new RTCLocalAvatar({ rtc: this }));
  }

  public getTestAvatar(): FlatRTCAvatar {
    return this.localAvatar;
  }

  public async getCameraDevices(): Promise<FlatRTCDevice[]> {
    return (await AgoraRTC.getCameras()).map(device => ({
      deviceId: device.deviceId,
      label: device.label,
    }));
  }

  public async getMicDevices(): Promise<FlatRTCDevice[]> {
    return (await AgoraRTC.getMicrophones()).map(device => ({
      deviceId: device.deviceId,
      label: device.label,
    }));
  }
}

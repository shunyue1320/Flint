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

  public static getInstance(): FlatRTCAgoraWeb {
    return (FlatRTCAgoraWeb._instance ??= new FlatRTCAgoraWeb());
  }

  public get localAvatar(): FlatRTCAvatar {
    return (this._localAvatar ??= new RTCLocalAvatar({ rtc: this }));
  }

  public getTestAvatar(): FlatRTCAvatar {
    return this.localAvatar;
  }
}

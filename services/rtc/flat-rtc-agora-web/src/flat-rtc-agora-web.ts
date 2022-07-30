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
import Emittery from "emittery";
import { SideEffectManager } from "side-effect-manager";
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

  public client?: IAgoraRTCClient;

  private readonly _sideEffect = new SideEffectManager();
  private readonly _roomSideEffect = new SideEffectManager();

  private _pJoiningRoom?: Promise<unknown>;

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

  public async joinRoom(config: FlatRTCAgoraWebJoinRoomConfig): Promise<void> {
    // /src/tasks/index.ts 启动项目时给的 APP_ID
    if (!FlatRTCAgoraWeb.APP_ID) {
      throw new Error("APP_ID is not set");
    }

    this._pJoiningRoom = this._createRTCClient(config);
    await this._pJoiningRoom;
    this._pJoiningRoom = undefined;
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
  }: FlatRTCAgoraWebJoinRoomConfig): Promise<void> {
    // 声网 rtc 建立连接
    const client = AgoraRTC.createClient({
      mode: mode === FlatRTCMode.Broadcast ? "live" : "rtc",
      codec: "vp8",
    });
    this.client = client;
    if (process.env.DEV) {
      (window as any).rtc_client = client;
    }

    // 设置连接角色
    if (mode === FlatRTCMode.Broadcast) {
      await client.setClientRole(role === FlatRTCRole.Host ? "host" : "audience");
    }

    if (process.env.DEV) {
      (window as any).rtc_client = client;
    }

    this._roomSideEffect.addDisposer(
      beforeAddListener(this.events, "network", () => {
        const handler = ({
          uplinkNetworkQuality,
          downlinkNetworkQuality,
        }: NetworkQuality): void => {
          console.log(
            "network-quality ==== |||||||||||||======000",
            uplinkNetworkQuality,
            downlinkNetworkQuality,
          );
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

  public localCameraTrack?: ICameraVideoTrack;
  public createLocalCameraTrack = singleRun(async (): Promise<ICameraVideoTrack> => {
    if (!this.localCameraTrack) {
      this.localCameraTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: { width: 288, height: 216 },
        cameraId: this._cameraID,
      });
    }
    return this.localCameraTrack;
  });
}

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

/**
 * @param events    监听器
 * @param eventName 要侦听的事件名称
 * @param init 在添加“eventName”的第一个侦听器之前运行。
 *             返回在删除最后一个侦听器时运行的disposer函数。
 * @returns 删除“listenerAdded”侦听器的disposer函数。
 */
function beforeAddListener(
  events: Emittery<FlatRTCEventData, FlatRTCEventData>,
  eventName: FlatRTCEventNames,
  init: () => (() => void) | undefined | void,
): () => void {
  // 获取 events 之前监听了 eventName 多少次
  let lastCount = events.listenerCount(eventName) || 0;
  let disposer: (() => void) | undefined | void;

  if (lastCount > 0) {
    disposer = init();
  }

  // 监听 eventName 监听事件的挂载与移除 执行参数二方法
  return (events as Emittery<FlatRTCEventData>).on(
    [Emittery.listenerAdded, Emittery.listenerRemoved],
    data => {
      if (data.eventName === eventName) {
        const count = events.listenerCount(eventName) || 0;
        if (lastCount === 0 && count > 0) {
          disposer = init();
        } else if (lastCount > 0 && count === 0) {
          disposer?.();
        }
        lastCount = count;
      }
    },
  );
}

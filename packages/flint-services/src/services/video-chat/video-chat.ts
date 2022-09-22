import { Remitter } from "remitter";
import { SideEffectManager } from "side-effect-manager";

import { IService } from "../typing";
import { IServiceVideoChatEventData } from "./events";
import { IServiceVideoChatRole, IServiceVideoChatMode } from "./constants";
import { IServiceShareScreen } from "./share-screen";

export interface IServiceVideoChatDevice {
  deviceId: string;
  label: string;
}

export interface IServiceVideoChatAvatar {
  enableCamera(enabled: boolean): void;
  enableMic(enabled: boolean): void;
  setElement(element: HTMLElement | null): void;
  getVolumeLevel(): number;
  destroy(): void;
}

export type IServiceVideoChatUID = string;

export interface IServiceVideoChatJoinRoomConfig {
  roomUUID: string;
  uid: IServiceVideoChatUID;
  mode?: IServiceVideoChatMode;
  role?: IServiceVideoChatRole;
  token?: string | null;
  refreshToken?: (roomUUID: string) => Promise<string>;
  shareScreenUID: IServiceVideoChatUID;
  shareScreenToken: string;
}

/** 存储当前 摄像机 麦克风 扬声器 ID */
export abstract class IServiceVideoChat implements IService {
  protected readonly sideEffect = new SideEffectManager();

  public readonly events = new Remitter<IServiceVideoChatEventData>();

  /** 共享屏幕服务 */
  public abstract readonly shareScreen: IServiceShareScreen;

  public async destroy(): Promise<void> {
    this.sideEffect.flushAll();
    this.events.destroy();
  }

  public abstract joinRoom(config: IServiceVideoChatJoinRoomConfig): Promise<void>;

  /** 设置聊天角色 */
  public abstract setRole(role: IServiceVideoChatRole): Promise<void>;

  public abstract getTestAvatar(): IServiceVideoChatAvatar;

  public abstract setCameraID(deviceId: string): Promise<void>;
  public abstract getCameraID(): string | undefined;

  public abstract setMicID(deviceId: string): Promise<void>;
  public abstract getMicID(): string | undefined;

  public abstract setSpeakerID(deviceId: string): Promise<void>;
  public abstract getSpeakerID(): string | undefined;

  public abstract getCameraDevices(): Promise<IServiceVideoChatDevice[]>;
  public abstract getMicDevices(): Promise<IServiceVideoChatDevice[]>;
  public abstract getSpeakerDevices(): Promise<IServiceVideoChatDevice[]>;
}

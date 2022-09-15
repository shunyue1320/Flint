import { Remitter } from "remitter";
import { SideEffectManager } from "side-effect-manager";

import { IService } from "../typing";
import { IServiceVideoChatEventData } from "./events";

export interface IServiceVideoChatDevice {
  deviceId: string;
  label: string;
}

export abstract class IServiceVideoChat implements IService {
  protected readonly sideEffect = new SideEffectManager();

  public readonly events = new Remitter<IServiceVideoChatEventData>();

  public async destroy(): Promise<void> {
    this.sideEffect.flushAll();
    this.events.destroy();
  }

  public abstract setCameraID(deviceId: string): Promise<void>;
  public abstract getCameraID(): string | undefined;

  public abstract setMicID(deviceId: string): Promise<void>;
  public abstract getMicID(): string | undefined;

  public abstract setSpeakerID(deviceId: string): Promise<void>;
  public abstract getSpeakerID(): string | undefined;
}

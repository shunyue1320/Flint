import { SideEffectManager } from "side-effect-manager";
import { Remitter } from "remitter";
import { ReadonlyVal } from "value-enhancer";
import { Region, RoomType } from "@netless/flint-server-api";

import { IServiceWhiteboardEvents } from "./events";
import { IServiceWhiteboardPhase } from "./constants";
import { IService } from "../typing";

export interface IServiceWhiteboard$Val {
  readonly phase$: ReadonlyVal<IServiceWhiteboardPhase>;
  readonly allowDrawing$: ReadonlyVal<boolean>;
}

export interface IServiceWhiteboardJoinRoomConfig extends IService {
  appID?: string;
  roomID: string;
  roomToken: string;
  uid: string;
  nickName: string;
  region: Region;
  classroomType: RoomType;
}

export abstract class IServiceWhiteboard {
  public readonly sideEffect = new SideEffectManager();

  public readonly events: IServiceWhiteboardEvents = new Remitter();

  public abstract readonly $Val: IServiceWhiteboard$Val;

  public abstract readonly roomID: string | null;

  public abstract readonly phase: IServiceWhiteboardPhase;

  public abstract readonly allowDrawing: boolean;

  public abstract setAllowDrawing(allowDrawing: boolean): void;

  public abstract joinRoom(config: IServiceWhiteboardJoinRoomConfig): Promise<void>;

  public abstract leaveRoom(): Promise<void>;

  public abstract render(el: HTMLElement): void;

  public abstract exportAnnotations(): Array<Promise<HTMLCanvasElement | null>>;

  public async destroy(): Promise<void> {
    this.events.destroy();
    this.sideEffect.flushAll();
  }
}

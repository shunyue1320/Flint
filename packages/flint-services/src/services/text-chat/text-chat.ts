import { Remitter } from "remitter";
import { SideEffectManager } from "side-effect-manager";
import { IService } from "../typing";

import {
  IServiceTextChatRoomCommandData,
  IServiceTextChatRoomCommandNames,
  IServiceTextChatPeerCommandData,
  IServiceTextChatPeerCommandNames,
} from "./commands";
import type { IServiceTextChatEvents } from "./events";

export interface IServiceTextChatJoinRoomConfig {
  roomUUID: string;
  ownerUUID: string;
  uid: string;
  token?: string | null;
}

export abstract class IServiceTextChat implements IService {
  protected readonly sideEffect = new SideEffectManager();

  public abstract readonly members: Set<string>;

  public readonly events: IServiceTextChatEvents = new Remitter();

  public async destroy(): Promise<void> {
    this.sideEffect.flushAll();
    this.events.destroy();
  }

  public abstract joinRoom(config: IServiceTextChatJoinRoomConfig): Promise<void>;
  public abstract leaveRoom(): Promise<void>;

  /** 向所有文件室成员发送文本消息 */
  public abstract sendRoomMessage(message: string): Promise<void>;

  /** 向对方发送文本消息 */
  public abstract sendPeerMessage(message: string, peerID: string): Promise<boolean>;

  /** 向所有教室成员发送命令消息 */
  public abstract sendRoomCommand<TName extends IServiceTextChatRoomCommandNames>(
    t: TName,
    v: IServiceTextChatRoomCommandData[TName],
    peerID: string,
  ): Promise<boolean>;

  /** 向对方发送命令消息 */
  public abstract sendPeerCommand<TName extends IServiceTextChatPeerCommandNames>(
    t: TName,
    v: IServiceTextChatPeerCommandData[TName],
    peerID: string,
  ): Promise<boolean>;
}

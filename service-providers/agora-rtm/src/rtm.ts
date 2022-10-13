import { SideEffectManager } from "side-effect-manager";
import RtmEngine, { RtmClient, RtmChannel } from "agora-rtm-sdk";
import { v4 as uuidv4 } from "uuid";

import { IServiceTextChat } from "@netless/flint-services";

export class AgoraRTM extends IServiceTextChat {
  public readonly members = new Set<string>();

  private readonly _sideEffect = new SideEffectManager();
  private readonly _roomSideEffect = new SideEffectManager();

  private _pJoiningRoom?: Promise<unknown>;
  private _pLeavingRoom?: Promise<unknown>;

  public readonly client: RtmClient;
  public channel?: RtmChannel;

  private roomUUID?: string;
  private userUUID?: string;
  private token?: string;

  public constructor(APP_ID: string) {
    super();
    if (!APP_ID) {
      throw new Error("APP_ID is not set");
    }
    this.client = RtmEngine.createInstance(APP_ID, {
      logFilter: RtmEngine.LOG_FILTER_WARNING,
    });
  }

  public override async destroy(): Promise<void> {
    super.destroy();
    this._sideEffect.flushAll();

    try {
      await this.leaveRoom();
      this.client.removeAllListeners();
    } catch (e) {
      console.error(e);
    }
  }

  public async joinRoom(config: IServiceTextChatJoinRoomConfig): Promise<void> {
    // 正在连接房间
    if (this._pJoiningRoom) {
      await this._pJoiningRoom;
    }
    // 正在退出房间
    if (this._pLeavingRoom) {
      await this._pLeavingRoom;
    }
    // 已经加入房间
    if (this.channel) {
      if (this.roomUUID === config.roomUUID) {
        return;
      }
      await this.leaveRoom();
    }

    this._pJoiningRoom = this._joinRoom(config);
    await this._pJoiningRoom;
    this._pJoiningRoom = undefined;
  }

  public async leaveRoom(): Promise<void> {
    if (this._pJoiningRoom) {
      await this._pJoiningRoom;
    }
    if (this._pLeavingRoom) {
      await this._pLeavingRoom;
    }

    if (this.channel) {
      this._roomSideEffect.flushAll();

      this._pLeavingRoom = this._leaveRoom(this.channel);
      await this._pLeavingRoom;
      this._pLeavingRoom = undefined;

      this.channel = undefined;
      this.token = undefined;
    }

    this.roomUUID = undefined;
    this.userUUID = undefined;
    this.members.clear();
  }

  public async sendRoomMessage(message: string): Promise<void> {
    if (this.channel) {
      await this.channel.sendMessage(
        {
          messageType: RtmEngine.MessageType.TEXT,
          text: message,
        },
        { enableHistoricalMessaging: true },
      );
      // emit到本地
      if (this.roomUUID && this.userUUID) {
        this.events.emit("room-message", {
          uuid: uuidv4(),
          roomUUID: this.roomUUID,
          text: message,
          senderID: this.userUUID,
          timestamp: Date.now(),
        });
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.error("sendRoomMessage: channel is not ready");
      }
    }
  }
}

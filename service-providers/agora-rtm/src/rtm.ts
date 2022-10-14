import { SideEffectManager } from "side-effect-manager";
import RtmEngine, { RtmClient, RtmChannel, RtmStatusCode, RtmMessage } from "agora-rtm-sdk";
import { v4 as uuidv4 } from "uuid";

import {
  IServiceTextChat,
  IServiceTextChatJoinRoomConfig,
  IServiceTextChatPeerCommand,
  IServiceTextChatPeerCommandData,
  IServiceTextChatPeerCommandNames,
  IServiceTextChatRoomCommand,
  IServiceTextChatRoomCommandData,
  IServiceTextChatRoomCommandNames,
} from "@netless/flint-services";
import { generateRTMToken } from "@netless/flint-server-api/src/agora";

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

  /** 加入房间 */
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

  /** 离开房间 */
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

  /** 发送文字消息 */
  public async sendRoomMessage(message: string): Promise<void> {
    if (this.channel) {
      // 发送文字消息
      await this.channel.sendMessage({
        messageType: RtmEngine.MessageType.TEXT,
        text: message,
      });
      // 发送成功后 emit 到本地
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

  /** 发送二进制命令系统消息 */
  public async sendRoomCommand<TName extends IServiceTextChatRoomCommandNames>(
    t: TName,
    v: IServiceTextChatRoomCommandData[TName],
  ): Promise<void> {
    if (this.channel) {
      const command = { t, v } as IServiceTextChatRoomCommand;
      // 发送二进制命令系统消息
      await this.channel.sendMessage({
        messageType: RtmEngine.MessageType.RAW,
        rawMessage: new TextEncoder().encode(JSON.stringify(command)),
      });
      // 发送成功后 emit 到本地
      if (this.roomUUID && this.userUUID) {
        this._emitRoomCommand(this.roomUUID, this.userUUID, command);
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.error("sendCommand: channel is not ready");
      }
    }
  }

  /** 向对方发送消息 */
  public async sendPeerMessage(message: string, peerID: string): Promise<boolean> {
    if (this.channel) {
      const result = await this.client.sendMessageToPeer({ text: message }, peerID);
      return result.hasPeerReceived;
    } else {
      if (process.env.NODE_ENV === "development") {
        console.error("sendPeerMessage: channel is not ready");
      }
      return false;
    }
  }

  /** 点对点发送消息 */
  public async sendPeerCommand<TName extends IServiceTextChatPeerCommandNames>(
    t: TName,
    v: IServiceTextChatPeerCommandData[TName],
    peerID: string,
  ): Promise<boolean> {
    if (this.channel) {
      const result = await this.client.sendMessageToPeer(
        {
          messageType: RtmEngine.MessageType.RAW,
          rawMessage: new TextEncoder().encode(JSON.stringify({ t, v })),
        },
        peerID,
      );
      return result.hasPeerReceived;
    } else {
      if (process.env.NODE_ENV === "development") {
        console.error("sendPeerMessage: channel is not ready");
      }
      return false;
    }
  }

  private async _joinRoom({
    uid,
    token,
    roomUUID,
    ownerUUID,
  }: IServiceTextChatJoinRoomConfig): Promise<void> {
    this.token = token || (await generateRTMToken());

    if (!this.token) {
      throw new Error("缺少声网 RTM 令牌");
    }

    // 1. 监听 token 过期 并刷新 token
    this._roomSideEffect.add(() => {
      const handler = async (): Promise<void> => {
        this.token = await generateRTMToken();
        await this.client.renewToken(this.token); // 刷新 token
      };
      this.client.on("TokenExpired", handler);
      return () => this.client.off("TokenExpired", handler);
    });

    // 2. 连接状态改变
    this._roomSideEffect.add(() => {
      const handler = (
        _state: RtmStatusCode.ConnectionState,
        reason: RtmStatusCode.ConnectionChangeReason,
      ): void => {
        if (reason === RtmEngine.ConnectionChangeReason.REMOTE_LOGIN) {
          this.events.emit("remote-login", { roomUUID });
        }
      };
      this.client.on("ConnectionStateChanged", handler);
      return () => this.client.off("ConnectionStateChanged", handler);
    });

    // 3. 先登录在进入房间
    await this.client.login({ uid, token: this.token });
    const channel = this.client.createChannel(roomUUID);
    this.channel = channel;

    // 4. 接收 文字｜系统 两种消息
    this._roomSideEffect.add(() => {
      const handler = (msg: RtmMessage, senderID: string): void => {
        switch (msg.messageType) {
          case RtmEngine.MessageType.TEXT: {
            this.events.emit("room-message", {
              uuid: uuidv4(),
              roomUUID,
              text: msg.text,
              senderID,
              timestamp: Date.now(),
            });
            break;
          }
          case RtmEngine.MessageType.RAW: {
            if (senderID === ownerUUID) {
              try {
                const command = JSON.parse(
                  new TextDecoder().decode(msg.rawMessage),
                ) as IServiceTextChatRoomCommand;
                this._emitRoomCommand(roomUUID, senderID, command);
              } catch (e) {
                console.error(e);
              }
            }
            break;
          }
        }
      };
      channel.on("ChannelMessage", handler);
      return () => channel.off("ChannelMessage", handler);
    });

    // 5. 监听点对点消息
    this._roomSideEffect.add(() => {
      const handler = (msg: RtmMessage, senderID: string): void => {
        if (msg.messageType === RtmEngine.MessageType.RAW) {
          try {
            const command = JSON.parse(
              new TextDecoder().decode(msg.rawMessage),
            ) as IServiceTextChatPeerCommand;
            // 消息不是这个房间的责抛弃
            if (command.v.roomUUID !== roomUUID) {
              return;
            }
            switch (command.t) {
              // 是举手消息
              case "raise-hand": {
                this.events.emit("raise-hand", {
                  roomUUID,
                  userUUID: senderID,
                  raiseHand: command.v.raiseHand,
                });
                break;
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      };
      this.client.on("MessageFromPeer", handler);
      return () => this.client.off("MessageFromPeer", handler);
    });

    // 6. 加入频道(教室) 并获取所有成员
    await channel.join();
    (await channel.getMembers()).forEach(userUUID => {
      this.members.add(userUUID);
    });

    // 7. 监听成员加入与离开
    this._roomSideEffect.add(() => {
      const onMemberJoin = (userUUID: string): void => {
        this.members.add(userUUID);
        this.events.emit("member-joined", { roomUUID, userUUID });
      };
      const onMemberLeave = (userUUID: string): void => {
        this.members.delete(userUUID);
        this.events.emit("member-left", { roomUUID, userUUID });
      };
      channel.on("MemberJoined", onMemberJoin);
      channel.on("MemberLeft", onMemberLeave);
      return () => {
        channel.off("MemberJoined", onMemberJoin);
        channel.off("MemberLeft", onMemberLeave);
      };
    });

    this.roomUUID = roomUUID;
    this.userUUID = uid;
  }

  private async _leaveRoom(channel: RtmChannel): Promise<void> {
    channel.removeAllListeners();
    await channel.leave();
    await this.client.logout();
  }

  /** 接收到的消息 emit 到外层 */
  private _emitRoomCommand(
    roomUUID: string,
    ownerUUID: string,
    command: IServiceTextChatRoomCommand,
  ): void {
    switch (command.t) {
      case "ban": {
        this.events.emit("ban", {
          uuid: uuidv4(),
          roomUUID,
          status: command.v.status,
          senderID: ownerUUID,
          timestamp: Date.now(),
        });
        break;
      }
      case "notice": {
        this.events.emit("notice", {
          uuid: uuidv4(),
          roomUUID,
          text: command.v.text,
          senderID: ownerUUID,
          timestamp: Date.now(),
        });
        break;
      }
      case "update-room-status": {
        this.events.emit("update-room-status", {
          roomUUID,
          status: command.v.status,
          senderID: ownerUUID,
        });
      }
    }
  }
}

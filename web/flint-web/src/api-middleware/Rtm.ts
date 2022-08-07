import { EventEmitter } from "eventemitter3";
import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import { AGORA, NODE_ENV } from "../constants/process";
// import { generateRTMToken } from "./flatServer/agora";
import { globalStore } from "../stores/GlobalStore";

export enum ClassModeType {
  Lecture = "Lecture",
  Interaction = "Interaction",
}

export enum RTMessageType {
  /** 组消息 */
  ChannelMessage = "ChannelMessage",
}
export type RTMEvents = {
  [RTMessageType.ChannelMessage]: string;
};

export declare interface Rtm {
  on<U extends keyof RTMEvents>(
    event: U,
    listener: (value: RTMEvents[U], senderId: string) => void,
  ): this;
  once<U extends keyof RTMEvents>(
    event: U,
    listener: (value: RTMEvents[U], senderId: string) => void,
  ): this;
}

export class Rtm extends EventEmitter<keyof RTMEvents> {
  public static MessageType = AgoraRTM.MessageType;

  public client: RtmClient; // Rtm客户端
  public channel?: RtmChannel; // 频道
  public commands?: RtmChannel; // 命令
  public token?: string;

  private channelID: string | null = null; // 频道ID
  private commandsID: string | null = null; // 命令ID

  public constructor() {
    super();

    if (!AGORA.APP_ID) {
      throw new Error("没有设置应用程序Id");
    }

    this.client = AgoraRTM.createInstance(AGORA.APP_ID, {
      logFilter: AgoraRTM.LOG_FILTER_WARNING,
    });

    this.client.on("TokenExpired", async () => { });

    this.client.on("ConnectionStateChanged", (newState, reason) => {
      console.log("RTM客户端状态: ", newState, reason);
    });

    this.client.on("MessageFromPeer", (msg, senderId) => {
      if (msg.messageType === AgoraRTM.MessageType.TEXT) {
        console.log("来自对方的消息 = ", msg, senderId);
      }
    });
  }

  public async init(userUUID: string, channelID: string): Promise<RtmChannel> {
    if (this.channel) {
      if (this.channelID === channelID) {
        return this.channel;
      } else {
        // await this.destroy();
      }
    }

    this.channelID = channelID;
    this.commandsID = this.channelID + "commands";

    this.token = globalStore.rtmToken; // (await generateRTMToken());

    // 由于实时重新加载，在开发中登录可能失败
    // await polly()

    this.channel = this.client.createChannel(channelID);
    await this.channel.join();
    this.channel.on("ChannelMessage", (msg, senderId) => {
      console.log("监听频道消息 =======", msg, senderId);
      if (msg.messageType === AgoraRTM.MessageType.TEXT) {
        this.emit(RTMessageType.ChannelMessage, msg.text, senderId);
      }
    });

    if (this.commandsID) {
      this.commands = this.client.createChannel(this.commandsID);
      await this.commands.join();
      this.commands.on("ChannelMessage", (msg, senderId) => {
        if (msg.messageType === AgoraRTM.MessageType.TEXT) {
          try {
            const { t, v } = JSON.parse(msg.text);
            if (t) {
              this.emit(t, v, senderId);
              if (NODE_ENV === "development") {
                console.log(`[RTM] Received command from ${senderId}: `, t, v);
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      });
    }

    return this.channel;
  }
}

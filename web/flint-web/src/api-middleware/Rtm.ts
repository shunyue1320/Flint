import polly from "polly-js";
import { v4 as uuidv4 } from "uuid";
import { EventEmitter } from "eventemitter3";
import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import { AGORA, NODE_ENV } from "../constants/process";
// import { generateRTMToken } from "./flatServer/agora";
import { globalStore } from "../stores/GlobalStore";

export interface RtmRESTfulQueryPayload {
  filter: {
    source?: string;
    destination?: string;
    start_time: string;
    end_time: string;
  };
  offset?: number;
  limit?: number;
  order?: string;
}

export interface RtmRESTfulQueryResponse {
  result: string;
  offset: number;
  limit: number;
  order: string;
  location: string;
}
export interface RtmRESTfulQueryResourceResponse {
  code: string;
  messages: Array<{
    dst: string;
    message_type: string;
    ms: number;
    payload: string;
    src: string;
  }>;
  request_id: string;
  result: string;
}

export enum ClassModeType {
  Lecture = "Lecture",
  Interaction = "Interaction",
}

export enum RTMessageType {
  /** 组消息 */
  ChannelMessage = "ChannelMessage",
  /** 通知消息 */
  Notice = "Notice",
  /** 创建者禁止所有rtm */
  BanText = "BanText",
  /** 首次创建教室时显示用户指南消息信息 */
  UserGuide = "UserGuide",
}
export type RTMEvents = {
  [RTMessageType.ChannelMessage]: string;
  [RTMessageType.Notice]: string;
  [RTMessageType.BanText]: boolean;
  [RTMessageType.UserGuide]: string;
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

    this.client.on("TokenExpired", async () => {
      console.log("trm token 过期===================");
    });

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

    // 由于实时重新加载，在开发中登录可能失败 所以在此登录
    await polly()
      .waitAndRetry(3)
      .executeForPromise(() => this.client.login({ uid: userUUID, token: this.token }));

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

  public async fetchTextHistory(startTime: number, endTime: number): Promise<RTMessage[]> {
    return (await this.fetchHistory(this.channelID, startTime, endTime)).map(message => ({
      type: RTMessageType.ChannelMessage,
      value: message.payload,
      uuid: uuidv4(),
      timestamp: message.ms,
      userUUID: message.src,
    }));
  }

  public async fetchHistory(
    channel: string | null,
    startTime: number,
    endTime: number,
  ): Promise<RtmRESTfulQueryResourceResponse["messages"]> {
    if (!channel) {
      throw new Error("RTM is not initiated. Call `rtm.init` first.");
    }

    // Rtm查询响应
    const { location } = await this.request<RtmRESTfulQueryPayload, RtmRESTfulQueryResponse>(
      "query",
      {
        filter: {
          destination: channel,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
        },
        offset: 0,
        limit: 100,
        order: "desc",
      },
    );

    const handle = location.replace(/^.*\/query\//, "");
    const result = await polly()
      .waitAndRetry([500, 800, 800])
      .executeForPromise(() => {
        // Rtm资源查询响应
        return this.request<null, RtmRESTfulQueryResourceResponse>(`query/${handle}`, null, {
          method: "GET",
        }).then(response => (response.code === "ok" ? response : Promise.reject(response)));
      });

    return result.messages.reverse();
  }

  private async request<P = any, R = any>(
    action: string,
    payload?: P,
    config: RequestInit = {},
  ): Promise<R> {
    if (!this.token) {
      // this.token = await generateRTMToken();
    }

    const response = await fetch(
      `https://api.agora.io/dev/v2/project/${AGORA.APP_ID}/rtm/message/history/${action}`,
      {
        method: "POST",
        headers: {
          "x-agora-token": this.token,
          "x-agora-uid": globalStore.userUUID || "",
          "Content-Type": "application/json",
          ...(config.headers || {}),
        },
        body: payload === null || payload === undefined ? void 0 : JSON.stringify(payload),
        ...config,
      },
    );

    if (!response.ok) {
      throw response;
    }
    return response.json();
  }
}

export interface RTMessage<U extends keyof RTMEvents = keyof RTMEvents> {
  type: U;
  value: RTMEvents[U];
  uuid: string;
  timestamp: number;
  userUUID: string;
}

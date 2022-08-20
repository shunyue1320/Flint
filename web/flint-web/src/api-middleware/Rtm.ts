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
  /** 更新自己的摄像头和麦克风状态 创造者可以关闭的相机和麦克风，但不能打开 */
  DeviceState = "DeviceState",
}
export type RTMEvents = {
  [RTMessageType.ChannelMessage]: string;
  [RTMessageType.Notice]: string;
  [RTMessageType.BanText]: boolean;
  [RTMessageType.UserGuide]: string;
  [RTMessageType.DeviceState]: { userUUID: string; camera: boolean; mic: boolean };
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
        if (NODE_ENV === "development") {
          console.log(`[RTM] Received message from ${senderId}: `, msg.text);
        }
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

  public async sendMessage(text: string): Promise<void>;
  public async sendMessage(text: string, peerId: string): Promise<{ hasPeerReceived: boolean }>;
  public async sendMessage(
    text: string,
    peerId?: string,
  ): Promise<{ hasPeerReceived: boolean } | void> {
    // 指定给某人发信息
    if (peerId !== void 0) {
      const result = await this.client.sendMessageToPeer(
        {
          messageType: AgoraRTM.MessageType.TEXT,
          text,
        },
        peerId,
      );

      if (NODE_ENV === "development") {
        console.log(`[RTM] send p2p message to ${peerId}: `, text);
      }

      return result;
    } else if (this.channel) {
      await this.channel.sendMessage({
        messageType: AgoraRTM.MessageType.TEXT,
        text,
      });

      if (NODE_ENV === "development") {
        console.log("[RTM] send group message: ", text);
      }
    }
  }

  public async sendCommand<U extends keyof RTMEvents>(command: {
    type: U;
    value: RTMEvents[U];
    keepHistory: boolean;
  }): Promise<void>;
  public async sendCommand<U extends keyof RTMEvents>(command: {
    type: U;
    value: RTMEvents[U];
    keepHistory: boolean;
    peerId: string;
    retry?: number;
  }): Promise<void>;
  public async sendCommand<U extends keyof RTMEvents>({
    type,
    value,
    keepHistory = false,
    peerId,
    retry = 0,
  }: {
    type: U;
    value: RTMEvents[U];
    keepHistory: boolean;
    peerId: string;
    retry?: number;
  }): Promise<void> {
    if (!this.commands || !this.commandsID) {
      if (NODE_ENV === "development") {
        console.warn("RTM command channel closed", type, JSON.stringify(value, null, " "));
      }
      return;
    }

    if (peerId === void 0) {
      await this.commands.sendMessage({
        messageType: AgoraRTM.MessageType.TEXT,
        text: JSON.stringify({ t: type, v: value }),
      });

      if (NODE_ENV === "development") {
        console.log("[RTM] send group command: ", type, value);
      }
    } else {
      await polly()
        .waitAndRetry(retry)
        .executeForPromise(async (): Promise<void> => {
          const { hasPeerReceived } = await this.client.sendMessageToPeer(
            {
              messageType: AgoraRTM.MessageType.TEXT,
              text: JSON.stringify({ r: this.commandsID, t: type, v: value }),
            },
            peerId,
          );
          if (NODE_ENV === "development") {
            console.log(`[RTM] send p2p command to ${peerId}: `, type, value);
          }
          if (!hasPeerReceived) {
            return Promise.reject("peer not received");
          }
        });
    }
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

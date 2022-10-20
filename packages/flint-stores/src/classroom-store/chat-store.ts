import { makeAutoObservable, observable, runInAction } from "mobx";
import { SideEffectManager } from "side-effect-manager";
import { ChatMsg } from "@netless/flint-components";
import { IServiceTextChat } from "@netless/flint-services";

export interface ChatStoreConfig {
  roomUUID: string;
  ownerUUID: string;
  rtm: IServiceTextChat;
  isShowUserGuide: boolean;
}

export class ChatStore {
  private readonly sideEffect = new SideEffectManager();

  public readonly messages = observable.array<ChatMsg>([]);
  public readonly rtm: IServiceTextChat;

  public constructor(config: ChatStoreConfig) {
    this.rtm = config.rtm;
    makeAutoObservable<this, "sideEffect">(this, {
      rtm: observable.ref,
      sideEffect: false,
    });

    // 需要显示用户指南 且 列表内没有 则显示
    if (config.isShowUserGuide && this.messages.every(m => m.type !== "user-guide")) {
      runInAction(() => {
        this.messages.push({
          type: "user-guide",
          uuid: "user-guide",
          timestamp: Date.now(),
          roomUUID: config.roomUUID,
          senderID: config.ownerUUID,
        });
      });
    }

    // 监听聊天室消息
    this.sideEffect.addDisposer(
      this.rtm.events.on("room-message", message => {
        this.newMessage({
          type: "room-message",
          ...message,
        });
      }),
    );

    // 监听提示消息
    this.sideEffect.addDisposer(
      this.rtm.events.on("notice", message => {
        this.newMessage({
          type: "notice",
          ...message,
        });
      }),
    );

    // 监听踢人消息
    this.sideEffect.addDisposer(
      this.rtm.events.on("ban", message => {
        this.newMessage({
          type: "ban",
          ...message,
        });
      }),
    );
  }

  public destroy(): void {
    this.sideEffect.flushAll();
  }

  /** 插入消息到聊天列表 */
  private newMessage = (message: ChatMsg): void => {
    // 1. 算出需要插入消息的下标
    const timestamp = Date.now();
    let insertPoint = 0;
    while (
      insertPoint < this.messages.length &&
      this.messages[insertPoint].timestamp <= timestamp
    ) {
      insertPoint++;
    }

    // 2. 在该下标的消息后面插入消息
    this.messages.splice(insertPoint, 0, message);
    this.onNewMessage(message);
  };

  /** 更新消息列表后的一个生命钩子函数（此方法被上游重写） */
  public onNewMessage(_message: ChatMsg): void {
    // do nothing
  }
}

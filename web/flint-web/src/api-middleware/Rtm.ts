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

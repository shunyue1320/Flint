import type { Remitter } from "remitter";

export interface IServiceTextChatEventData {
  "remote-login": { roomUUID: string };
  "room-message": {
    roomUUID: string;
    uuid: string;
    timestamp: number;
    text: string;
    senderID: string;
  };
  ban: {
    roomUUID: string;
    uuid: string;
    timestamp: number;
    status: boolean;
    senderID: string;
  };
  notice: {
    roomUUID: string;
    uuid: string;
    timestamp: number;
    text: string;
    senderID: string;
  };
}

export type IServiceTextChatEvents = Remitter<IServiceTextChatEventData>;

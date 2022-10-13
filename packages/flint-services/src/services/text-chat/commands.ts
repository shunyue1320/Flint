import { RoomStatus } from "@netless/flint-server-api";

export interface IServiceTextChatRoomCommandData {
  "update-room-status": { roomUUID: string; status: RoomStatus };
  ban: { roomUUID: string; status: boolean };
  notice: { roomUUID: string; text: string };
}

export type IServiceTextChatRoomCommandNames = keyof IServiceTextChatRoomCommandData;

export interface IServiceTextChatPeerCommandData {
  /** 从学生到老师 */
  "raise-hand": { roomUUID: string; raiseHand: boolean };
}

export type IServiceTextChatPeerCommandNames = keyof IServiceTextChatPeerCommandData;

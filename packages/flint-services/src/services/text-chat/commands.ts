import { RoomStatus } from "@netless/flint-server-api";

export interface IServiceTextChatRoomCommandData {
  "update-room-status": { roomUUID: string; status: RoomStatus };
  ban: { roomUUID: string; status: boolean };
  notice: { roomUUID: string; text: string };
}

export type IServiceTextChatRoomCommandNames = keyof IServiceTextChatRoomCommandData;

export type IServiceTextChatRoomCommand<
  TName extends IServiceTextChatRoomCommandNames = IServiceTextChatRoomCommandNames,
> = TName extends IServiceTextChatRoomCommandNames
  ? { t: TName; v: IServiceTextChatRoomCommandData[TName] }
  : never;

export interface IServiceTextChatPeerCommandData {
  /** 从学生到老师 */
  "raise-hand": { roomUUID: string; raiseHand: boolean };
}

export type IServiceTextChatPeerCommandNames = keyof IServiceTextChatPeerCommandData;

export type IServiceTextChatPeerCommand<
  TName extends IServiceTextChatPeerCommandNames = IServiceTextChatPeerCommandNames,
> = TName extends IServiceTextChatPeerCommandNames
  ? { t: TName; v: IServiceTextChatPeerCommandData[TName] }
  : never;

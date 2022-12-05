import { RoomStatus, RoomType, Week, Region } from "./constants";
import { post } from "./utils";

export interface CreateOrdinaryRoomPayload {
  title: string;
  type: RoomType;
  beginTime: number;
  region: Region;
  endTime?: number;
}

export interface CreateOrdinaryRoomResult {
  roomUUID: string;
  inviteCode: string;
}

export async function createOrdinaryRoom(payload: CreateOrdinaryRoomPayload): Promise<string> {
  const res = await post<CreateOrdinaryRoomPayload, CreateOrdinaryRoomResult>(
    "room/create/ordinary",
    payload,
  );
  return res.roomUUID;
}

export enum ListRoomsType {
  All = "all",
  Today = "today",
  Periodic = "periodic",
  History = "history",
}

export interface FlatServerRoom {
  roomUUID: string;
  periodicUUID: string | null;
  ownerUUID: string;
  inviteCode: string;
  roomType: RoomType;
  ownerName: string;
  ownerAvatarURL: string;
  title: string;
  beginTime: number;
  endTime: number;
  roomStatus: RoomStatus;
  hasRecord?: boolean;
}

export type ListRoomsPayload = {
  page: number;
};

export type ListRoomsResult = FlatServerRoom[];

export function listRooms(
  type: ListRoomsType,
  payload: ListRoomsPayload,
): Promise<ListRoomsResult> {
  return post<undefined, ListRoomsResult>(`room/list/${type}?page=${payload.page}`);
}

export interface JoinRoomPayload {
  uuid: string;
}

export interface JoinRoomResult {
  roomType: RoomType;
  roomUUID: string;
  ownerUUID: string;
  whiteboardRoomToken: string;
  whiteboardRoomUUID: string;
  rtcUID: number;
  rtcToken: string;
  rtcShareScreen: {
    uid: number;
    token: string;
  };
  rtmToken: string;
  showGuide: boolean;
}

export function joinRoom(uuid: string): Promise<JoinRoomResult> {
  return post<JoinRoomPayload, JoinRoomResult>("room/join", { uuid });
}

export interface UsersInfoPayload {
  roomUUID: string;
  usersUUID?: string[];
}

export type UsersInfoResult = {
  [key in string]: {
    name: string;
    rtcUID: number;
    avatarURL: string;
  };
};

export function usersInfo(payload: UsersInfoPayload): Promise<UsersInfoResult> {
  return post<UsersInfoPayload, UsersInfoResult>("room/info/users", payload);
}

export type PeriodicRoomInfoResult = {
  periodic: {
    ownerUUID: string;
    ownerName: string;
    endTime: number;
    rate: number | null;
    title: string;
    weeks: Week[];
    roomType: RoomType;
    region: Region;
    inviteCode: string;
  };
  rooms: Array<{
    roomUUID: string;
    beginTime: number;
    endTime: number;
    roomStatus: RoomStatus;
  }>;
};

export interface OrdinaryRoomInfo {
  title: string;
  beginTime: number;
  endTime: number;
  roomType: RoomType;
  roomStatus: RoomStatus;
  ownerUUID: string;
  ownerName: string;
  region: Region;
}

export interface OrdinaryRoomInfoPayload {
  roomUUID: string;
}

export interface OrdinaryRoomInfoResult {
  roomInfo: OrdinaryRoomInfo;
  inviteCode: string;
}

export function ordinaryRoomInfo(roomUUID: string): Promise<OrdinaryRoomInfoResult> {
  return post<OrdinaryRoomInfoPayload, OrdinaryRoomInfoResult>("room/info/ordinary", {
    roomUUID,
  });
}

export interface StartClassPayload {
  roomUUID: string;
}
export type StartClassResult = {};

export function startClass(roomUUID: string): Promise<StartClassResult> {
  return post<StartClassPayload, StartClassResult>("room/update-status/started", {
    roomUUID,
  });
}

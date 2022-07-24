import { Region } from "flint-components";
import { postNotAuth, post } from "./utils";
import { RoomStatus, RoomType } from "./constants";

export interface bindingPhoneSendCodePayload {
  phone: string; // +86155...
}

export type bindingPhoneSendCodeResult = {};

export async function bindingPhoneSendCode(phone: string): Promise<bindingPhoneSendCodeResult> {
  return await postNotAuth<bindingPhoneSendCodePayload, bindingPhoneSendCodeResult>(
    "user/binding/platform/phone/sendMessage ",
    {
      phone,
    },
  );
}

export interface BindingPhonePayload {
  phone: string;
  code: number;
}

export type BindingPhoneResult = {};

export async function bindingPhone(phone: string, code: number): Promise<BindingPhoneResult> {
  return await post<BindingPhonePayload, BindingPhoneResult>("user/binding/platform/phone", {
    phone,
    code,
  });
}

export interface LoginProcessResult {
  name: string;
  avatar: string;
  userUUID: string;
  token: string;
  hasPhone: boolean;
  agoraSSOLoginID?: string;
}

export interface loginProcessPayload {
  authUUID: string;
}

export async function loginProcess(authUUID: string): Promise<LoginProcessResult> {
  return await postNotAuth<loginProcessPayload, LoginProcessResult>("login/process", {
    authUUID,
  });
}

export interface LoginCheckPayload { }

export interface LoginCheckResult {
  name: string;
  avatar: string;
  userUUID: string;
  token: string;
  hasPhone: boolean;
}

export async function loginCheck(token?: string): Promise<LoginCheckResult> {
  return await post<LoginCheckPayload, LoginCheckResult>("login", {}, {}, token);
}

export interface setAuthUUIDPayload {
  authUUID: string;
}
export interface setAuthUUIDResult {
  authUUID: string;
}

export async function setAuthUUID(authUUID: string): Promise<setAuthUUIDResult> {
  return await postNotAuth<setAuthUUIDPayload, setAuthUUIDResult>("login/set-auth-uuid", {
    authUUID,
  });
}

export interface loginPhoneSendCodePayload {
  phone: string; // +86145...
}

export type LoginPhoneSendCodeResult = {};

export async function loginPhoneSendCode(phone: string): Promise<LoginPhoneSendCodeResult> {
  return await postNotAuth<loginPhoneSendCodePayload, LoginPhoneSendCodeResult>(
    "login/phone/sendMessage",
    { phone },
  );
}

export interface loginPhonePayload {
  phone: string;
  code: number;
}

export async function loginPhone(phone: string, code: number): Promise<LoginProcessResult> {
  return await postNotAuth<loginPhonePayload, LoginProcessResult>("login/phone", {
    phone,
    code,
  });
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

export interface JoinRoomPayload {
  uuid: string;
}

export function joinRoom(uuid: string): Promise<JoinRoomResult> {
  return post<JoinRoomPayload, JoinRoomResult>("room/join", { uuid });
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
  return post<undefined, ListRoomsResult>(`room/list/${type}`, undefined, payload);
}

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

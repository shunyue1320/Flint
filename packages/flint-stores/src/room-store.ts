import { makeAutoObservable, observable, runInAction } from "mobx";
import { globalStore } from "./global-store";
import {
  joinRoom,
  JoinRoomResult,
  listRooms,
  ListRoomsType,
  ListRoomsPayload,
  createOrdinaryRoom,
  CreateOrdinaryRoomPayload,
  PeriodicRoomInfoResult,
  RoomType,
  RoomStatus,
} from "@netless/flint-server-api";
// import { RoomType, RoomStatus } from "../api-middleware/flatServer/constants";
import { preferencesStore } from "./preferences-store";

export enum Region {
  CN_HZ = "cn-hz",
  US_SV = "us-sv",
  SG = "sg",
  IN_MUM = "in-mum",
  GB_LON = "gb-lon",
}

export interface RoomRecording {
  beginTime: number;
  endTime: number;
  videoURL?: string;
}

/**
 * 有时，我们可能只有部分房间信息
 * 普通房间 + 定期子房间
 */
export interface RoomItem {
  roomUUID: string;
  ownerUUID: string;
  inviteCode?: string;
  roomType?: RoomType;
  periodicUUID?: string;
  ownerName?: string;
  ownerAvatarURL?: string;
  title?: string;
  roomStatus?: RoomStatus;
  region?: Region;
  beginTime?: number;
  endTime?: number;
  previousPeriodicRoomBeginTime?: number;
  nextPeriodicRoomEndTime?: number;
  count?: number;
  hasRecord?: boolean;
  recordings?: RoomRecording[];
}

export interface PeriodicRoomItem {
  periodicUUID: string;
  periodic: PeriodicRoomInfoResult["periodic"];
  rooms: string[];
  inviteCode: string;
}

/**
 * 缓存所有访问的房间。
 * 这应该是所有房间信息的唯一中央存储。
 */
export class RoomStore {
  public rooms = observable.map<string, RoomItem>();
  public periodicRooms = observable.map<string, PeriodicRoomItem>();

  public constructor() {
    makeAutoObservable(this);
  }

  public async joinRoom(roomUUID: string): Promise<JoinRoomResult> {
    const data = await joinRoom(roomUUID);
    globalStore.updateToken(data);
    this.updateRoom(roomUUID, data.ownerUUID, {
      roomUUID,
      ownerUUID: data.ownerUUID,
      roomType: data.roomType,
    });

    return data;
  }

  /**
   * @returns 房间 UUID 列表
   */
  public async listRooms(type: ListRoomsType, payload: ListRoomsPayload): Promise<string[]> {
    const rooms = await listRooms(type, payload);
    const roomUUIDs: string[] = [];

    runInAction(() => {
      for (const room of rooms) {
        roomUUIDs.push(room.roomUUID);
        this.updateRoom(room.roomUUID, room.ownerUUID, {
          ...room,
          periodicUUID: room.periodicUUID || void 0,
        });
      }
    });

    return roomUUIDs;
  }

  public updateRoom(roomUUID: string, ownerUUID: string, roomInfo: Partial<RoomItem>): void {
    const room = this.rooms.get(roomUUID);
    if (room) {
      const keys = Object.keys(roomInfo) as unknown as Array<keyof RoomItem>;
      for (const key of keys) {
        if (key !== "roomUUID") {
          (room[key] as any) = roomInfo[key];
        }
      }
    } else {
      this.rooms.set(roomUUID, { ...roomInfo, roomUUID, ownerUUID });
    }
  }

  /**
   * @returns roomUUID
   */
  public async createOrdinaryRoom(payload: CreateOrdinaryRoomPayload): Promise<string> {
    if (!globalStore.userUUID) {
      throw new Error("cannot create room: user not login.");
    }

    const roomUUID = await createOrdinaryRoom(payload);
    preferencesStore.setRegion(payload.region);
    const { ...restPayload } = payload;
    this.updateRoom(roomUUID, globalStore.userUUID, {
      ...restPayload,
      roomUUID,
    });

    return roomUUID;
  }
}

export const roomStore = new RoomStore();

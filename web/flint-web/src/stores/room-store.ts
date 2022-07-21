import { observable } from "mobx";
import { RoomType, RoomStatus } from "../api-middleware/flatServer/constants";
import { globalStore } from "./GlobalStore";

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
  recordings?: Array<{
    beginTime: number;
    endTime: number;
    videoURL?: string;
  }>;
}

export class RoomStore {
  public rooms = observable.map<string, RoomItem>();

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
}

export const roomStore = new RoomStore();

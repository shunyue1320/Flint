import { useReplaceNavigate, RouteNameType } from "../utils/routes";
import { errorTips } from "@netless/flint-components";
import { roomStore } from "@netless/flint-stores";
import { RoomType } from "@netless/flint-server-api";

export const joinRoomHandler = async (
  roomUUID: string,
  replaceNavigate: ReturnType<typeof useReplaceNavigate>,
): Promise<void> => {
  try {
    const formatRoomUUID = roomUUID.replace(/\s+/g, "");
    const roomInfo = roomStore.rooms.get(formatRoomUUID);
    const periodicUUID = roomInfo?.periodicUUID;
    const data = await roomStore.joinRoom(periodicUUID || formatRoomUUID);
    // 尝试解决chrome不显示权限后弹出的问题
    // 软导航。这里我们做一个“硬”导航。
    switch (data.roomType) {
      case RoomType.BigClass: {
        console.log("进入大班");
        replaceNavigate(RouteNameType.BigClassPage, data);
        break;
      }
      case RoomType.SmallClass: {
        console.log("进入小班");
        break;
      }
      case RoomType.OneToOne: {
        console.log("进入一对一");
        break;
      }
      default: {
        new Error("failed to join room: incorrect room type");
      }
    }
  } catch (e) {
    replaceNavigate(RouteNameType.HomePage);
    errorTips(e);
  }
};

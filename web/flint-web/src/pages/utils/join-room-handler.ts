import { usePushNavigate, RouteNameType } from "../../utils/routes";
import { errorTips } from "../../components/Tips/ErrorTips";
import { roomStore } from "../../stores/room-store";
import { RoomType } from "../../api-middleware/flatServer/constants";

export const joinRoomHandler = async (
  roomUUID: string,
  pushNavigate: ReturnType<typeof usePushNavigate>,
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
        pushNavigate(RouteNameType.BigClassPage, data);
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
    pushNavigate(RouteNameType.HomePage);
    errorTips(e);
  }
};

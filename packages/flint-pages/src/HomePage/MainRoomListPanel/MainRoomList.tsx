import React, { useState, useCallback, useContext, useEffect, Fragment } from "react";

import { useTranslation } from "react-i18next";
import { errorTips } from "@netless/flint-components";
import { RoomStoreContext, GlobalStoreContext } from "../../components/StoreProvider";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { RoomItem } from "@netless/flint-stores";
import { ListRoomsType, RoomStatus } from "@netless/flint-server-api";
import { RouteNameType, usePushNavigate } from "../../utils/routes";
import { joinRoomHandler } from "../../utils/join-room-handler";

import {
  RoomListItemPrimaryAction,
  RoomListItem,
  RoomListAllLoaded,
  RoomStatusType,
} from "@netless/flint-components";
export interface MainRoomListProps {
  isLogin: boolean;
  listRoomsType: ListRoomsType;
}

export const MainRoomList: React.FC<MainRoomListProps> = ({ isLogin, listRoomsType }) => {
  const { t } = useTranslation();
  const pushNavigate = usePushNavigate();
  const sp = useSafePromise();
  const roomStore = useContext(RoomStoreContext);
  const globalStore = useContext(GlobalStoreContext);
  const [roomUUIDs, setRoomUUIDs] = useState<string[]>();
  const isHistoryList = listRoomsType === ListRoomsType.History;

  const refreshRooms = useCallback(
    async function refreshRooms(): Promise<void> {
      try {
        const roomUUIDs = await sp(roomStore.listRooms(listRoomsType, { page: 1 }));
        setRoomUUIDs(roomUUIDs);
      } catch (e) {
        setRoomUUIDs([]);
        errorTips(e);
      }
    },
    [listRoomsType, roomStore, sp],
  );

  useEffect(() => {
    if (!isLogin) {
      return;
    }
    void refreshRooms();
    const ticket = window.setInterval(refreshRooms, 30 * 1000);
    return () => {
      window.clearInterval(ticket);
    };
  }, [refreshRooms, isLogin]);

  if (!roomUUIDs) {
    return null;
  }

  async function joinRoom(roomUUID: string): Promise<void> {
    if (globalStore.isTurnOffDeviceTest) {
      await joinRoomHandler(roomUUID, pushNavigate);
    } else {
      pushNavigate(RouteNameType.DevicesTestPage, { roomUUID });
    }
  }

  // 通过 roomUUID 去 roomStore 内拿数据
  return (
    <>
      {customSort(roomUUIDs?.map(roomUUID => roomStore.rooms.get(roomUUID))).map(room => {
        if (!room) {
          return null;
        }

        const beginTime = room.beginTime ? new Date(room.beginTime) : void 0;
        const endTime = room.endTime ? new Date(room.endTime) : void 0;

        // 动态按钮，定义按钮的名字 类型(type) 与 对应key执行的功能
        const primaryAction = (
          roomStatus?: RoomStatus,
        ): RoomListItemPrimaryAction<"replay" | "join" | "begin"> | null => {
          let primaryAction: RoomListItemPrimaryAction<"replay" | "join" | "begin"> | null;

          switch (roomStatus) {
            case RoomStatus.Idle: {
              const isCreator = room.ownerUUID === globalStore.userUUID;
              primaryAction = isCreator
                ? {
                    key: "begin",
                    text: t("begin"),
                    type: "primary",
                  }
                : {
                    key: "join",
                    text: t("join"),
                    type: "primary",
                  };
              break;
            }
            case RoomStatus.Started:
            case RoomStatus.Paused: {
              primaryAction = {
                key: "join",
                text: t("join"),
                type: "primary",
              };
              break;
            }

            case RoomStatus.Stopped: {
              primaryAction = room.hasRecord
                ? {
                    key: "replay",
                    text: t("replay"),
                  }
                : null;
              break;
            }

            default: {
              primaryAction = {
                key: "begin",
                text: t("begin"),
                type: "primary",
              };
              break;
            }
          }

          return primaryAction;
        };

        return (
          <Fragment key={room.roomUUID}>
            <RoomListItem
              beginTime={beginTime}
              endTime={endTime}
              isPeriodic={!!room.periodicUUID}
              menuActions={getSubActions(room)}
              ownerAvatar={room.ownerAvatarURL}
              ownerName={room.ownerName}
              primaryAction={primaryAction(room.roomStatus)}
              status={getRoomStatus(room.roomStatus)}
              title={room.title!}
              onAction={key => {
                switch (key) {
                  case "join":
                  case "begin": {
                    void joinRoom(room.roomUUID);
                    break;
                  }
                  default: // not default
                }
                console.log(`执行 ${key} 对应的功能`);
              }}
            ></RoomListItem>
          </Fragment>
        );
      })}
      <RoomListAllLoaded />
    </>
  );

  // 请求历史列表时 history 需要按照时间排序
  function customSort(rooms: Array<RoomItem | undefined>): Array<RoomItem | undefined> {
    if (listRoomsType === ListRoomsType.History) {
      return rooms.sort((a, b) => (a && b ? Number(b.beginTime) - Number(a.beginTime) : 0));
    }
    return rooms;
  }

  type SubActions =
    | Array<{ key: "details" | "delete-history"; text: string }>
    | Array<{ key: "details" | "modify" | "cancel" | "invite"; text: string }>;

  function getSubActions(room: RoomItem): SubActions {
    const result = [{ key: "details", text: t("room-detail") }];

    if (isHistoryList) {
      if (room.roomUUID) {
        result.push({ key: "delete-history", text: t("delete-records") });
      }
    } else {
      // 闲置的状态 （isCreator: 房间所有者就是本人） 支持修改，否则支持取消
      const ownerUUID = room.ownerUUID;
      const isCreator = ownerUUID === globalStore.userUUID;
      if (
        (room.roomUUID || room.periodicUUID) &&
        isCreator &&
        room.roomStatus === RoomStatus.Idle
      ) {
        result.push({ key: "modify", text: t("modify-room") });
      }
      if (!isCreator || room.roomStatus === RoomStatus.Idle) {
        result.push({
          key: "cancel",
          text: isCreator ? t("cancel-room") : t("remove-room"),
        });
      }
      // 所有人都支持邀请
      if (room.roomUUID) {
        result.push({ key: "invite", text: t("invitation") });
      }
    }

    return result as SubActions;
  }

  function getRoomStatus(roomStatus?: RoomStatus): RoomStatusType {
    switch (roomStatus) {
      case RoomStatus.Idle: {
        return "upcoming";
      }
      case RoomStatus.Started:
      case RoomStatus.Paused: {
        return "running";
      }
      case RoomStatus.Stopped: {
        return "stopped";
      }

      default: {
        return "upcoming";
      }
    }
  }
};

import "./MainRoomMenu.less";

import React, { useContext } from "react";
import { Row, Col } from "antd";

import { Region } from "@netless/flint-components";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import { JoinRoomBox } from "./JoinRoomBox";
import { CreateRoomBox } from "./CreateRoomBox";
import { ScheduleRoomBox } from "./ScheduleRoomBox";
import { RouteNameType, usePushNavigate } from "../../utils/routes";
import { joinRoomHandler } from "../../utils/join-room-handler";
import { errorTips } from "@netless/flint-components";
import { RoomType } from "@netless/flint-server-api";

export const MainRoomMenu: React.FC = () => {
  const globalStore = useContext(GlobalStoreContext);
  const roomStore = useContext(RoomStoreContext);
  const pushNavigate = usePushNavigate();

  const onJoinRoom = async (roomUUID: string): Promise<void> => {
    if (globalStore.isTurnOffDeviceTest) {
      await joinRoomHandler(roomUUID, usePushNavigate);
    } else {
      pushNavigate(RouteNameType.DevicesTestPage, { roomUUID });
    }
  };

  return (
    <div className="main-room-menu-container">
      <Row gutter={16}>
        <Col span={6}>
          <JoinRoomBox onJoinRoom={onJoinRoom} />
        </Col>
        <Col span={6}>
          <CreateRoomBox onCreateRoom={createOrdinaryRoom} />
        </Col>
        <Col span={6}>
          <ScheduleRoomBox />
        </Col>
      </Row>
    </div>
  );

  async function createOrdinaryRoom(title: string, type: RoomType, region: Region): Promise<void> {
    try {
      const roomUUID = await roomStore.createOrdinaryRoom({
        title,
        type,
        beginTime: Date.now(),
        region,
      });
      // 跳转至房间页面
      await onJoinRoom(roomUUID);
    } catch (e) {
      errorTips(e);
    }
  }
};

export default MainRoomMenu;

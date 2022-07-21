import "./MainRoomMenu.less";

import React, { useContext } from "react";
import { Row, Col } from "antd";

import { GlobalStoreContext } from "../../../components/StoreProvider";
import { JoinRoomBox } from "./JoinRoomBox";
import { CreateRoomBox } from "./CreateRoomBox";
import { ScheduleRoomBox } from "./ScheduleRoomBox";
import { usePushNavigate } from "../../../utils/routes";
import { joinRoomHandler } from "../../utils/join-room-handler";

export const MainRoomMenu: React.FC = () => {
  const globalStore = useContext(GlobalStoreContext);

  const onJoinRoom = async (roomUUID: string): Promise<void> => {
    if (globalStore.isTurnOffDeviceTest) {
      await joinRoomHandler(roomUUID, usePushNavigate);
    } else {
      // usePushNavigate("进入设备测试页面")
    }
    console.log("加入房间");
  };

  return (
    <div className="main-room-menu-container">
      <Row gutter={16}>
        <Col span={6}>
          <JoinRoomBox onJoinRoom={onJoinRoom} />
        </Col>
        <Col span={6}>
          <CreateRoomBox />
        </Col>
        <Col span={6}>
          <ScheduleRoomBox />
        </Col>
      </Row>
    </div>
  );
};

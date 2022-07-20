import "./MainRoomMenu.less";

import React from "react";
import { Row, Col } from "antd";

import { JoinRoomBox } from "./JoinRoomBox";
import { CreateRoomBox } from "./CreateRoomBox";
import { ScheduleRoomBox } from "./ScheduleRoomBox";

export const MainRoomMenu: React.FC = () => {
  const onJoinRoom = (): void => {
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

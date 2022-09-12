import React from "react";
import { useTranslation } from "react-i18next";
import { RoomList } from "@netless/flint-components";

import { MainRoomList } from "../MainRoomListPanel/MainRoomList";
import { ListRoomsType } from "@netless/flint-server-api";
export interface MainRoomHistoryPanelProps {
  isLogin: boolean;
}

export const MainRoomHistoryPanel: React.FC<MainRoomHistoryPanelProps> = ({ isLogin }) => {
  const { t } = useTranslation();
  return (
    <RoomList title={t("history")}>
      <MainRoomList isLogin={isLogin} listRoomsType={ListRoomsType.History} />
    </RoomList>
  );
};

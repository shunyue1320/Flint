import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { RoomList } from "flint-components";

export interface MainRoomListPanelProps {
  isLogin: boolean;
}

export type activeTabType = "all" | "today" | "periodic";

export const MainRoomListPanel: React.FC = ({ isLogin }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<activeTabType>("all");
  const filters = useMemo<Array<{ key: activeTabType; title: string }>>(
    () => [
      {
        key: "all",
        title: t("all"),
      },
      {
        key: "today",
        title: t("today"),
      },
      {
        key: "periodic",
        title: t("periodic"),
      },
    ],
    [t],
  );
  return (
    <RoomList
      activeTab={activeTab}
      filters={filters}
      title={t("room-list")}
      onTabActive={setActiveTab}
    ></RoomList>
  );
};

export default MainRoomListPanel;

import "./style.less";

import React, { useContext, useEffect } from "react";

import { MainRoomMenu } from "./MainRoomMenu";
import { useLoginCheck } from "../utils/use-login-check";
import { PageStoreContext } from "../../components/StoreProvider";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";

export const HomePage: React.FC = () => {
  const pageStore = useContext(PageStoreContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => pageStore.configure(), []);

  const isLogin = useLoginCheck();

  return (
    <div className="homepage-layout-horizontal-container">
      <MainRoomMenu />
      <div className="homepage-layout-horizontal-content">
        <MainRoomListPanel isLogin={isLogin} />
        <MainRoomHistoryPanel isLogin={isLogin} />
      </div>
    </div>
  );
};

export default HomePage;

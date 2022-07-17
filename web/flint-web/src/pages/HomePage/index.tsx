import React from "react";

import { MainRoomMenu } from "./MainRoomMenu";
import { useLoginCheck } from "../utils/use-login-check";

export const HomePage: React.FC = () => {
  const isLogin = useLoginCheck();

  return (
    <div className="homepage-layout-horizontal-container">
      <MainRoomMenu />
      <div className="homepage-layout-horizontal-content"></div>
    </div>
  );
};

export default HomePage;

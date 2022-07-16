import "./index.less";

import React, { useContext } from "react";

import { Cover } from "./icons/Cover";
import { CoverDark } from "./icons/CoverDark";
import { DarkModeContext } from "../FlintThemeProvider";

export * from "./LoginWithPhone";
export interface LoginPanelProps {
  children: React.ReactNode;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({ children }) => {
  const darkMode = useContext(DarkModeContext);
  return (
    <div className="login-panel-container">
      <div className="login-panel-cover">{darkMode ? <CoverDark /> : <Cover />}</div>
      <div className="login-panel-inner">{children}</div>
    </div>
  );
};

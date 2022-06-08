import "./LoginPanel.less";

import React from "react";
import { Cover } from "./icons/Cover";

export interface LoginPanelProps {
  children: React.ReactNode;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({ children }) => {
  return (
    <div className="login-panel-container">
      <div className="login-panel-cover">{<Cover />}</div>
      <div className="login-panel-inner">{children}</div>
    </div>
  );
};

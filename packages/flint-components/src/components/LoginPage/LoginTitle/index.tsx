import "./index.less";

import React from "react";

export interface LoginTitleProps {
  title?: string;
  subtitle?: string;
}

export const LoginTitle: React.FC<LoginTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="login-title">
      <h2 className="login-title-text">{title || "欢迎使用 Flat"}</h2>
      <p className="login-title-subtext">{subtitle || "在线互动，让想法同步"}</p>
    </div>
  );
};

import "./index.less";

import React from "react";

export interface LoginTitleProps {
  title?: string;
  subtitle?: string;
}

export const LoginTitle: React.FC<LoginTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="login-title">
      <h2 className="login-title-text">{title}</h2>
      <p className="login-title-subtext">{subtitle}</p>
    </div>
  );
};

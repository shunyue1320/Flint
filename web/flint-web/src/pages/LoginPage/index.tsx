import "./style.less";

import React from "react";
import { LoginPanel } from "./LoginPanel";

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page-container">
      <LoginPanel>1234</LoginPanel>
    </div>
  );
};

export default LoginPage;

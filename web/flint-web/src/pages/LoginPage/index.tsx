import "./style.less";

import React from "react";
import { LoginPanel } from "./LoginPanel";
import { LoginWithPhone } from "./LoginWithPhone";

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page-container">
      <LoginPanel>
        <LoginWithPhone />
      </LoginPanel>
    </div>
  );
};

export default LoginPage;

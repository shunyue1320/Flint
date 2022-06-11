import "./style.less";

import React from "react";
import { LoginPanel } from "./LoginPanel";
import { LoginWithPhone } from "./LoginWithPhone";
import { PRIVACY_URL, SERVICE_URL } from "../../constants/process";

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page-container">
      <LoginPanel>
        <LoginWithPhone
          buttons={["wechat", "github"]}
          privacyURL={PRIVACY_URL}
          renderQRCode={() => <div>二维码</div>}
          serviceURL={SERVICE_URL}
        />
      </LoginPanel>
    </div>
  );
};

export default LoginPage;

import checkedSVG from "./icons/checked.svg";
import "./index.less";

import React, { useState } from "react";
import { Input } from "antd";

import { LoginTitle } from "../LoginTitle";
import { LoginPanelContent } from "../LoginPanelContent";

export const LoginWithPhone: React.FC<{}> = ({ buttons: userButtons, renderQRCode }) => {
  const [showQRCode, setShowQRCode] = useState(false);

  function renderQRCodePage(): React.ReactNode {
    return (
      <div className="login-with-wechat">
        <div className="login-width-limiter">
          <div className="login-qrcode">{renderQRCode()}</div>
        </div>
      </div>
    );
  }

  function renderLoginPage(): React.ReactNode {
    return (
      <div className="login-with-phone">
        <div className="login-width-limiter">
          <LoginTitle />
          <Input />
        </div>
      </div>
    );
  }

  const key = showQRCode ? "qrcode" : "login";

  return (
    <LoginPanelContent transitionKey={key}>
      {showQRCode ? renderQRCodePage() : renderLoginPage()}
    </LoginPanelContent>
  );
};

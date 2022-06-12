import "./WeChatLogin.less";

import React, { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

import { LoginProcessResult, setAuthUUID } from "../../api-middleware/flatServer";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { FLAT_SERVER_LOGIN } from "../../api-middleware/flatServer/constants";
import { WECHAT } from "../../constants/process";

export interface WeChatLoginProps {
  setLoginResult: (result: LoginProcessResult) => void;
}

export const WeChatLogin: React.FC<WeChatLoginProps> = ({ setLoginResult }) => {
  const [qrCodeURL, setQRCodeURL] = useState("");
  // const sp = useSafePromise();

  useEffect(() => {
    const authUUID = uuidv4();

    setQRCodeURL(getQRCodeURL(authUUID));
  }, []);

  return (
    <div className="wechat-login-container">
      <iframe
        className="wechat-login-iframe"
        frameBorder="0"
        src={qrCodeURL}
        title="wechat"
      ></iframe>
      <div className="wechat-login-spin">
        <LoadingOutlined spin />
      </div>
      <span className="wechat-login-text">请使用微信扫描二维码登录</span>
    </div>
  );
};

export default WeChatLogin;

function getQRCodeURL(authUUID: string): string {
  // redirectURL: 授权回调域 (扫码授权后)
  const redirectURL = encodeURIComponent(`${FLAT_SERVER_LOGIN.WECHAT_CALLBACK}`);
  const qrCodeStyle = `
  .impowerBox .qrcode {
    width: 238px;
    margin: 0;
  }
  .impowerBox .title {
    display: none;
  }
  .status_icon {
    display: none;
  }
  .impowerBox .status {
    text-align: center;
  }
  .impowerBox .info {
    display: none;
  }
  `;

  return `https://open.weixin.qq.com/connect/qrconnect?appid=${
    WECHAT.APP_ID
  }&scope=snsapi_login&redirect_uri=${redirectURL}&state=${authUUID}&login_type=jssdk&self_redirect=true&style=black&href=data:text/css;base64,${window.btoa(
    qrCodeStyle,
  )}`;
}

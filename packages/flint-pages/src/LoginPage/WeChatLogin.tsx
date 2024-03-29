import "./WeChatLogin.less";

import React, { useEffect, useState } from "react";
import { useTranslate } from "@netless/flint-i18n";
import { LoadingOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

import {
  loginProcess,
  LoginProcessResult,
  setAuthUUID,
  FLAT_SERVER_LOGIN,
} from "@netless/flint-server-api";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { WECHAT } from "../constants/process";
import { errorTips } from "@netless/flint-components";

export interface WeChatLoginProps {
  setLoginResult: (result: LoginProcessResult) => void;
}

type Ticket = {
  current?: number;
};

export const WeChatLogin: React.FC<WeChatLoginProps> = ({ setLoginResult }) => {
  const [qrCodeURL, setQRCodeURL] = useState("");
  const sp = useSafePromise();

  const t = useTranslate();

  useEffect(() => {
    const authUUID = uuidv4();
    const ticket: Ticket = {};

    // 1. 获取二维码路径
    setQRCodeURL(getQRCodeURL(authUUID));

    // 3. 每隔2秒通过authUUID获取用户登入状态 作用：后端通过 redirectURL 获取的 code 请求微信拿到用户信息与token 不在前端暴露 appid secret
    const loginProcessRequest = (ticket: Ticket, authUUID: string): void => {
      ticket.current = window.setTimeout(async () => {
        const data = await sp(loginProcess(authUUID));
        if (data.userUUID === "") {
          loginProcessRequest(ticket, authUUID);
        } else {
          setLoginResult(data);
        }
      }, 2000);
    };

    // 1. 告诉服务器 state=authUUID 防止csrf攻击（跨站请求伪造攻击）
    sp(setAuthUUID(authUUID))
      .then(loginProcessRequest.bind(null, ticket, authUUID))
      .catch(errorTips);

    return () => {
      window.clearTimeout(ticket.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="wechat-login-container">
      <iframe
        className="wechat-login-iframe"
        frameBorder="0"
        scrolling="no"
        src={qrCodeURL}
        title="wechat"
      ></iframe>
      <div className="wechat-login-spin">
        <LoadingOutlined spin />
      </div>
      <span className="wechat-login-text">{t("wechat-login-tips")}</span>
    </div>
  );
};

export default WeChatLogin;

function getQRCodeURL(
  authUUID: string,
  redirect_uri: string = FLAT_SERVER_LOGIN.WECHAT_CALLBACK,
): string {
  const redirectURL = encodeURIComponent(`${redirect_uri}`);
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

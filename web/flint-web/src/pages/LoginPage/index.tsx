import "./style.less";

import React, { useCallback, useState, useRef } from "react";
import { LoginPanel } from "./LoginPanel";
import { LoginWithPhone } from "./LoginWithPhone";
import { PRIVACY_URL, SERVICE_URL } from "../../constants/process";
import {
  loginPhone,
  loginPhoneSendCode,
  LoginProcessResult,
} from "../../api-middleware/flatServer";
import { errorTips } from "../../components/Tips/ErrorTips";
import { WeChatLogin } from "./WeChatLogin";
import { LoginButtonProviderType } from "./LoginButtons";
import { LoginDisposer } from "./utils";

export const LoginPage: React.FC = () => {
  const [loginResult, setLoginResult_] = useState<LoginProcessResult | null>(null);
  const loginDisposer = useRef<LoginDisposer>();

  const setLoginResult = useCallback((userInfo: LoginProcessResult | null) => {
    setLoginResult_(userInfo);
  }, []);

  const onLoginResult = useCallback(async (authData: LoginProcessResult) => {
    if (authData.agoraSSOLoginID) {
      console.log(authData.agoraSSOLoginID);
    }
  }, []);

  const handleLogin = useCallback((loginChannel: LoginButtonProviderType) => {
    if (loginDisposer.current) {
      loginDisposer.current();
      loginDisposer.current = void 0;
    }

    switch (loginChannel) {
      case "agora": {
        return;
      }
      case "github": {
        return;
      }
      case "google": {
        return;
      }
      default: {
        return;
      }
    }
  }, []);

  return (
    <div className="login-page-container">
      <LoginPanel>
        <LoginWithPhone
          buttons={["wechat", "github"]}
          loginOrRegister={(countryCode, phone, code) =>
            wrap(loginPhone(countryCode + phone, Number(code)).then(onLoginResult))
          }
          privacyURL={PRIVACY_URL}
          renderQRCode={() => <WeChatLogin setLoginResult={setLoginResult} />}
          sendVerificationCode={async (countryCode, phone) =>
            wrap(loginPhoneSendCode(countryCode + phone))
          }
          serviceURL={SERVICE_URL}
          onClickButton={handleLogin}
        />
      </LoginPanel>
    </div>
  );
};

// 监控promise成功返回： true， 失败返回：false
function wrap(promise: Promise<unknown>): Promise<boolean> {
  return promise
    .then(() => true)
    .catch(err => {
      // 捕获错误并提示
      errorTips(err);
      return false;
    });
}

export default LoginPage;

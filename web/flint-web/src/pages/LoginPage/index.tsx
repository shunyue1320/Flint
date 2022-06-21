import "./style.less";

import React, { useCallback, useState, useRef, useContext } from "react";
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
import { NEED_BINDING_PHONE } from "../../constants/config";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { usePushNavigate, RouteNameType } from "../../utils/routes";

console.log("NEED_BINDING_PHONE", NEED_BINDING_PHONE);

export const LoginPage: React.FC = () => {
  const pushNavigate = usePushNavigate();
  const globalStore = useContext(GlobalStoreContext);
  const [loginResult, setLoginResult_] = useState<LoginProcessResult | null>(null);
  const loginDisposer = useRef<LoginDisposer>();

  const setLoginResult = useCallback(
    (userInfo: LoginProcessResult | null) => {
      globalStore.updateUserInfo(userInfo);
      setLoginResult_(userInfo);
      // 是中国已绑定手机号用户自动跳转到 home 页面
      if (userInfo && (NEED_BINDING_PHONE ? userInfo.hasPhone : true)) {
        pushNavigate(RouteNameType.HomePage);
      }
    },
    [globalStore, pushNavigate],
  );

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

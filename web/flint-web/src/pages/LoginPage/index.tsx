import "./style.less";

import React, { useCallback, useState, useRef, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LoginPanel, LoginButtonProviderType, LoginWithPhone } from "/flint-components";

import {
  bindingPhone,
  bindingPhoneSendCode,
  loginPhone,
  loginPhoneSendCode,
  LoginProcessResult,
  loginCheck,
} from "../../api-middleware/flatServer";
import { LoginDisposer } from "./utils";
import { WeChatLogin } from "./WeChatLogin";
import { githubLogin } from "./githubLogin";
import { googleLogin } from "./googleLogin";
import { agoraLogin } from "./agoraLogin";
import { NEED_BINDING_PHONE } from "../../constants/config";
import { PRIVACY_URL_CN, PRIVACY_URL, SERVICE_URL_CN, SERVICE_URL } from "../../constants/process";
import { errorTips } from "../../components/Tips/ErrorTips";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { usePushNavigate, RouteNameType, useURLParams } from "../../utils/routes";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export const LoginPage: React.FC = () => {
  const { i18n } = useTranslation();
  const pushNavigate = usePushNavigate();
  const globalStore = useContext(GlobalStoreContext);
  const [loginResult, setLoginResult_] = useState<LoginProcessResult | null>(null);
  const loginDisposer = useRef<LoginDisposer>();
  // 是否存在房间 UUID
  const [roomUUID] = useState(() => sessionStorage.getItem("roomUUID"));

  const sp = useSafePromise();
  const urlParams = useURLParams();

  const setLoginResult = useCallback(
    (userInfo: LoginProcessResult | null) => {
      globalStore.updateUserInfo(userInfo);
      setLoginResult_(userInfo);
      // 是中国已绑定手机号用户自动跳转到 home 页面， 没有绑定走 isBindingPhone 显示绑定页面
      if (userInfo && (NEED_BINDING_PHONE ? userInfo.hasPhone : true)) {
        pushNavigate(RouteNameType.HomePage);
      }
    },
    [globalStore, pushNavigate],
  );

  const onLoginResult = useCallback(
    async (authData: LoginProcessResult) => {
      globalStore.updateUserInfo(authData);
      if (NEED_BINDING_PHONE && !authData.hasPhone) {
        setLoginResult(authData);
        return;
      }
      if (!roomUUID) {
        pushNavigate(RouteNameType.HomePage);
        return;
      }

      if (globalStore.isTurnOffDeviceTest) {
        console.log("直接前往房间");
      } else {
        console.log("先去测试页面测试麦克风与相机，再前往房间");
      }
    },
    [globalStore, pushNavigate, roomUUID, setLoginResult],
  );

  const onBoundPhone = useCallback(() => {
    if (loginResult) {
      onLoginResult({ ...loginResult, hasPhone: true });
    }
  }, [loginResult, onLoginResult]);

  const handleLogin = useCallback(
    (loginChannel: LoginButtonProviderType) => {
      if (loginDisposer.current) {
        loginDisposer.current();
        loginDisposer.current = void 0;
      }

      switch (loginChannel) {
        case "agora": {
          agoraLogin(onLoginResult);
          return;
        }
        case "github": {
          loginDisposer.current = githubLogin(onLoginResult);
          return;
        }
        case "google": {
          loginDisposer.current = googleLogin(onLoginResult);
          return;
        }
        default: {
          return;
        }
      }
    },
    [onLoginResult],
  );

  useEffect(() => {
    return () => {
      if (loginDisposer.current) {
        loginDisposer.current();
        loginDisposer.current = void 0;
      }
      sessionStorage.clear();
    };
  }, []);

  useEffect(() => {
    if (urlParams.utm_source === "agora") {
      handleLogin("agora");
    }
  }, [handleLogin, urlParams.utm_source]);

  useEffect(() => {
    const checkNormalLogin = async (): Promise<void> => {
      const userInfo = await sp(loginCheck(urlParams.token));
      if (NEED_BINDING_PHONE && !userInfo.hasPhone) {
        setLoginResult(userInfo);
      }
    };

    checkNormalLogin().catch(err => {
      console.warn(err);
    });
  }, [setLoginResult, sp, urlParams.token]);

  const privacyURL = i18n.language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL;
  const serviceURL = i18n.language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL;

  return (
    <div className="login-page-container">
      <LoginPanel>
        <LoginWithPhone
          bindingPhone={async (countryCode, phone, code) =>
            wrap(bindingPhone(countryCode + phone, Number(code)).then(onBoundPhone))
          }
          buttons={["wechat", "github"]}
          // 清空 userInfo
          cancelBindingPhone={() => setLoginResult(null)}
          isBindingPhone={NEED_BINDING_PHONE && (loginResult ? !loginResult.hasPhone : false)}
          loginOrRegister={(countryCode, phone, code) =>
            wrap(loginPhone(countryCode + phone, Number(code)).then(onLoginResult))
          }
          privacyURL={privacyURL}
          renderQRCode={() => <WeChatLogin setLoginResult={setLoginResult} />}
          // 发送 绑定 验证码
          sendBindingPhoneCode={async (countryCode, phone) =>
            wrap(bindingPhoneSendCode(countryCode + phone))
          }
          // 发送 登录 验证码
          sendVerificationCode={async (countryCode, phone) =>
            wrap(loginPhoneSendCode(countryCode + phone))
          }
          serviceURL={serviceURL}
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

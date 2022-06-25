import "./style.less";

import React, { useCallback, useState, useRef, useContext } from "react";
import { LoginPanel, LoginButtonProviderType, LoginWithPhone } from "flint-components";

import { PRIVACY_URL, SERVICE_URL } from "../../constants/process";
import {
  bindingPhone,
  bindingPhoneSendCode,
  loginPhone,
  loginPhoneSendCode,
  LoginProcessResult,
} from "../../api-middleware/flatServer";
import { errorTips } from "../../components/Tips/ErrorTips";
import { WeChatLogin } from "./WeChatLogin";
import { LoginDisposer } from "./utils";
import { NEED_BINDING_PHONE } from "../../constants/config";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { usePushNavigate, RouteNameType } from "../../utils/routes";

export const LoginPage: React.FC = () => {
  const pushNavigate = usePushNavigate();
  const globalStore = useContext(GlobalStoreContext);
  const [loginResult, setLoginResult_] = useState<LoginProcessResult | null>(null);
  const loginDisposer = useRef<LoginDisposer>();

  const [roomUUID] = useState(() => sessionStorage.getItem("roomUUID"));

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
          bindingPhone={async (countryCode, phone, code) =>
            wrap(bindingPhone(countryCode + phone, Number(code)))
          }
          buttons={["wechat", "github"]}
          // 清空 userInfo
          cancelBindingPhone={() => setLoginResult(null)}
          isBindingPhone={NEED_BINDING_PHONE && (loginResult ? !loginResult.hasPhone : false)}
          loginOrRegister={(countryCode, phone, code) =>
            wrap(loginPhone(countryCode + phone, Number(code)).then(onLoginResult))
          }
          privacyURL={PRIVACY_URL}
          renderQRCode={() => <WeChatLogin setLoginResult={setLoginResult} />}
          // 发送 绑定 验证码
          sendBindingPhoneCode={async (countryCode, phone) =>
            wrap(bindingPhoneSendCode(countryCode + phone))
          }
          // 发送 登录 验证码
          sendVerificationCode={async (countryCode, phone) =>
            wrap(loginPhoneSendCode(countryCode + phone))
          }
          serviceURL={SERVICE_URL}
          onClickButton={handleLogin}
          // sendBindingPhoneCode?: (countryCode: string, phone: string) => Promise<boolean>;
          // bindingPhone?: (countryCode: string, phone: string, code: string) => Promise<boolean>;
          // cancelBindingPhone?: () => void;
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

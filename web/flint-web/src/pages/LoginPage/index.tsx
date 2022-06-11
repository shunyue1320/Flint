import "./style.less";

import React from "react";
import { LoginPanel } from "./LoginPanel";
import { LoginWithPhone } from "./LoginWithPhone";
import { PRIVACY_URL, SERVICE_URL } from "../../constants/process";
import { loginPhoneSendCode } from "../../api-middleware/flatServer";
import { errorTips } from "../../components/Tips/ErrorTips";

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page-container">
      <LoginPanel>
        <LoginWithPhone
          buttons={["wechat", "github"]}
          loginOrRegister={(countryCode, phone, code) => wrap()}
          privacyURL={PRIVACY_URL}
          renderQRCode={() => <div>二维码</div>}
          sendVerificationCode={async (countryCode, phone) =>
            wrap(loginPhoneSendCode(countryCode + phone))
          }
          serviceURL={SERVICE_URL}
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

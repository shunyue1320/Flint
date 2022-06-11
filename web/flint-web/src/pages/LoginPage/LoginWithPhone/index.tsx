import checkedSVG from "./icons/checked.svg";
import "./index.less";

import React, { useCallback, useMemo, useState } from "react";
import { Input, Select, Button, Modal, message } from "antd";

import { COUNTRY_CODES } from "./data";
import { LoginTitle } from "../LoginTitle";
import { LoginPanelContent } from "../LoginPanelContent";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";
import { LoginButtons, LoginButtonsDescription, LoginButtonProviderType } from "../LoginButtons";
import { useIsUnMounted, useSafePromise } from "../../../utils/hooks";

export function validatePhone(phone: string): boolean {
  console.log("------111");
  return phone.length >= 5 && !/\D/.test(phone);
}
export function validateCode(code: string): boolean {
  return code.length === 6;
}

export interface LoginWithPhoneProps {
  buttons: LoginButtonProviderType[];
  privacyURL?: LoginAgreementProps["privacyURL"];
  serviceURL?: LoginAgreementProps["serviceURL"];
  renderQRCode: () => React.ReactNode;
  loginOrRegister: (countryCode: string, phone: string, code: string) => Promise<boolean>;
}

export const LoginWithPhone: React.FC<LoginWithPhoneProps> = ({
  buttons: userButtons,
  privacyURL,
  serviceURL,
  renderQRCode,
  loginOrRegister,
}) => {
  const sp = useSafePromise();

  const buttons = useMemo<LoginButtonsDescription>(
    () =>
      userButtons
        ? userButtons.map(e => ({ provider: e, text: undefined }))
        : [
            { provider: "wechat", text: undefined },
            { provider: "github", text: undefined },
          ],
    [userButtons],
  );

  const [showQRCode, setShowQRCode] = useState(false);
  const [countryCode, setCountryCode] = useState("+86");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [clickedLogin, setClickedLogin] = useState(false);

  const canLogin = validatePhone(phone) && validateCode(code);

  const login = useCallback(async () => {
    if (!agreed) {
      if (!(await requestAgreement({ privacyURL, serviceURL }))) {
        return;
      }
      setAgreed(true);
      if (canLogin) {
        setClickedLogin(true);
        const success = await sp(loginOrRegister(countryCode, phone, code));
        if (success) {
          // 登入成功截流
          await sp(new Promise(resolve => setTimeout(resolve, 60000)));
        } else {
          message.error("登录失败");
        }
        setClickedLogin(false);
      }
    }
  }, [agreed, canLogin, privacyURL, serviceURL, sp, loginOrRegister, countryCode, phone, code]);

  const providerLogin = useCallback(async () => {
    if (!agreed) {
      if (!(await requestAgreement({ privacyURL, serviceURL }))) {
        return;
      }
      setAgreed(true);
    }
  }, [agreed]);

  function renderQRCodePage(): React.ReactNode {
    return (
      <div className="login-with-wechat">
        <div className="login-width-limiter">
          <div className="login-qrcode">{renderQRCode()}</div>
          <Button className="login-btn-back" type="link" onClick={() => setShowQRCode(false)}>
            返回
          </Button>
        </div>
      </div>
    );
  }

  function renderLoginPage(): React.ReactNode {
    return (
      <div className="login-with-phone">
        <div className="login-width-limiter">
          <LoginTitle />
          <Input
            placeholder="请输入手机号"
            prefix={
              <Select bordered={false} defaultValue="+86" onChange={setCountryCode}>
                {COUNTRY_CODES.map(code => (
                  <Select.Option key={code} value={`+${code}`}>
                    {`+${code}`}
                  </Select.Option>
                ))}
              </Select>
            }
            size="small"
            status={!phone || validatePhone(phone) ? "" : "error"}
            value={phone}
            onChange={ev => setPhone(ev.currentTarget.value)}
          />
          <Input
            placeholder="请输入验证码"
            prefix={<img alt="checked" draggable={false} src={checkedSVG} />}
            status={!code || validateCode(code) ? undefined : "error"}
            suffix={
              <Button disabled={!validatePhone(phone)} size="small" type="link">
                发送验证码
              </Button>
            }
            value={code}
            onChange={ev => setCode(ev.currentTarget.value)}
          />
          <LoginAgreement
            checked={agreed}
            privacyURL={privacyURL}
            serviceURL={serviceURL}
            onChange={setAgreed}
          />
          <Button
            className="login-big-button"
            disabled={!canLogin}
            loading={clickedLogin}
            type="primary"
            onClick={login}
          >
            注册或登录
          </Button>
        </div>
        <div className="login-splitter">
          <span className="login-splitter-text">也可以通过以下方式直接登录</span>
        </div>
        <LoginButtons buttons={buttons} onClick={providerLogin} />
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

export interface RequestAgreementParams {
  privacyURL?: string;
  serviceURL?: string;
}

export function requestAgreement({
  privacyURL,
  serviceURL,
}: RequestAgreementParams): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    Modal.confirm({
      content: (
        <div>
          已阅读并同意{" "}
          <a href={privacyURL} rel="noreferrer" target="_blank">
            隐私政策
          </a>{" "}
          和{" "}
          <a href={serviceURL} rel="noreferrer" target="_blank">
            服务协议
          </a>
        </div>
      ),
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

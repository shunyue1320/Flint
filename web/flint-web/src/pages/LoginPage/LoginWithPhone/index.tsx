import checkedSVG from "./icons/checked.svg";
import "./index.less";

import React, { useState } from "react";
import { Input, Select, Button } from "antd";

import { COUNTRY_CODES } from "./data";
import { LoginTitle } from "../LoginTitle";
import { LoginPanelContent } from "../LoginPanelContent";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";

export function validatePhone(phone: string): boolean {
  return phone.length >= 5 && !/\D/.test(phone);
}
export function validateCode(code: string): boolean {
  return code.length === 6;
}

export interface LoginWithPhoneProps {
  privacyURL?: LoginAgreementProps["privacyURL"];
  serviceURL?: LoginAgreementProps["privacyURL"];
  renderQRCode: () => React.ReactNode;
}

export const LoginWithPhone: React.FC<LoginWithPhoneProps> = ({
  privacyURL,
  serviceURL,
  renderQRCode,
}) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [countryCode, setCountryCode] = useState("+86");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  console.log("==========11", validatePhone(phone) && validateCode(code));
  const canLogin = validatePhone(phone) && validateCode(code);

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
          <Button className="login-big-button" disabled={!canLogin} type="primary">
            注册或登录
          </Button>
        </div>
        <div className="login-splitter">
          <span className="login-splitter-text">也可以通过以下方式直接登录</span>
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

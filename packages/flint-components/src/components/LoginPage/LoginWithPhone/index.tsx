import checkedSVG from "./icons/checked.svg";
import "./index.less";

import React, { useCallback, useMemo, useState } from "react";
import { Input, Select, Button, Modal, message } from "antd";
import { useTranslation, TFunction } from "react-i18next";

import { COUNTRY_CODES } from "./data";
import { LoginTitle } from "../LoginTitle";
import { LoginPanelContent } from "../LoginPanelContent";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";
import {
  LoginButtons,
  LoginButtonsDescription,
  LoginButtonProviderType,
  LoginButtonsProps,
} from "../LoginButtons";
import { useIsUnMounted, useSafePromise } from "../../../utils/hooks";

export * from "../LoginButtons";

export function validatePhone(phone: string): boolean {
  return phone.length >= 5 && !/\D/.test(phone);
}
export function validateCode(code: string): boolean {
  return code.length === 6;
}

export interface LoginWithPhoneProps {
  buttons: LoginButtonProviderType[];
  privacyURL?: LoginAgreementProps["privacyURL"];
  serviceURL?: LoginAgreementProps["serviceURL"];
  isBindingPhone?: boolean;
  sendBindingPhoneCode?: (countryCode: string, phone: string) => Promise<boolean>;
  bindingPhone?: (countryCode: string, phone: string, code: string) => Promise<boolean>;
  cancelBindingPhone?: () => void;
  renderQRCode: () => React.ReactNode;
  loginOrRegister: (countryCode: string, phone: string, code: string) => Promise<boolean>;
  sendVerificationCode: (countryCode: string, phone: string) => Promise<boolean>;
  onClickButton: LoginButtonsProps["onClick"];
}

export const LoginWithPhone: React.FC<LoginWithPhoneProps> = ({
  buttons: userButtons,
  privacyURL,
  serviceURL,
  isBindingPhone,
  sendBindingPhoneCode,
  bindingPhone,
  cancelBindingPhone,
  renderQRCode,
  loginOrRegister,
  sendVerificationCode,
  onClickButton,
}) => {
  const sp = useSafePromise();
  const { t } = useTranslation();

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

  const isUnMountRef = useIsUnMounted();
  const [showQRCode, setShowQRCode] = useState(false);
  const [countryCode, setCountryCode] = useState("+86");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [clickedLogin, setClickedLogin] = useState(false);
  const [bindingPhoneCode, setBindingPhoneCode] = useState(""); // 绑定电话验证码
  const [clickedBinding, setClickedBinding] = useState(false);

  const canLogin = validatePhone(phone) && validateCode(code);
  const canBinding = !clickedBinding && validatePhone(phone) && validateCode(bindingPhoneCode); // 绑定按钮

  const sendCode = useCallback(async () => {
    if (validatePhone(phone)) {
      setSendingCode(true);
      const sent = await sp(sendVerificationCode(countryCode, phone));
      setSendingCode(false);
      if (sent) {
        void message.info("已发送验证码");
        let count = 60;
        setCountdown(count);
        const timer = setInterval(() => {
          // 如果组件卸载了就清除定时器，防止内存泄漏
          if (isUnMountRef.current) {
            clearInterval(timer);
            return;
          }
          setCountdown(--count);
          if (count === 0) {
            clearInterval(timer);
          }
        }, 1000);
      } else {
        message.error("验证码发送失败");
      }
    }
  }, [countryCode, phone, isUnMountRef, sendVerificationCode, sp]);

  const sendBindingCode = useCallback(async () => {
    if (validatePhone(phone) && sendBindingPhoneCode) {
      setSendingCode(true);
      const send = await sp(sendBindingPhoneCode(countryCode, phone));
      setSendingCode(false);
      if (send) {
        void message.info("已发送验证码");
        let count = 60;
        setCountdown(count);
        const timer = setInterval(() => {
          // 如果组件卸载了就清除定时器，防止内存泄漏
          if (isUnMountRef.current) {
            clearInterval(timer);
            return;
          }
          setCountdown(--count);
          if (count === 0) {
            clearInterval(timer);
          }
        }, 1000);
      } else {
        message.error("验证码发送失败");
      }
    }
  }, [countryCode, phone, sendBindingPhoneCode, sp, isUnMountRef]);

  // 验证码登录
  const login = useCallback(async () => {
    if (!agreed) {
      if (!(await requestAgreement({ privacyURL, serviceURL }))) {
        return;
      }
      setAgreed(true);
    }

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
  }, [agreed, canLogin, privacyURL, serviceURL, sp, loginOrRegister, countryCode, phone, code]);

  // 绑定手机号登录
  const bindPhone = useCallback(async () => {
    if (!agreed) {
      if (!(await requestAgreement({ privacyURL, serviceURL }))) {
        return;
      }
      setAgreed(true);
    }

    if (canBinding && bindingPhone) {
      setClickedBinding(true);
      const success = await sp(bindingPhone(countryCode, phone, bindingPhoneCode));
      if (success) {
        await sp(new Promise(resolve => setTimeout(resolve, 60000)));
      } else {
        message.error("登录失败");
      }
      setClickedBinding(false);
    }
  }, [
    agreed,
    bindingPhone,
    bindingPhoneCode,
    canBinding,
    countryCode,
    phone,
    privacyURL,
    serviceURL,
    sp,
  ]);

  const providerLogin = useCallback(
    async (provider: LoginButtonProviderType) => {
      // 勾选协议弹窗
      if (!agreed) {
        if (!(await requestAgreement({ privacyURL, serviceURL }))) {
          return;
        }
        setAgreed(true);
      }

      if (provider === "wechat") {
        setShowQRCode(true);
      } else {
        onClickButton(provider);
      }
    },
    [agreed, privacyURL, serviceURL, onClickButton],
  );

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
              countdown > 0 ? (
                <span className="login-countdown">{countdown} 秒后重新获取</span>
              ) : (
                <Button
                  disabled={sendingCode || !validatePhone(phone)}
                  size="small"
                  type="link"
                  onClick={sendCode}
                >
                  发送验证码
                </Button>
              )
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

  const key = isBindingPhone ? "bind-phone" : showQRCode ? "qrcode" : "login";

  return (
    <LoginPanelContent transitionKey={key}>
      {isBindingPhone
        ? renderBindPhonePage({
            t,
            phone,
            setPhone,
            countdown,
            setCountryCode,
            bindingPhoneCode,
            setBindingPhoneCode,
            sendingCode,
            sendBindingCode,
            canBinding,
            clickedBinding,
            bindPhone,
            cancelBindingPhone: () => cancelBindingPhone?.(),
          })
        : showQRCode
        ? renderQRCodePage()
        : renderLoginPage()}
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

export interface RenderBindPhonePageProps {
  t: TFunction;
  phone: string;
  setPhone: (phone: string) => void;
  countdown: number;
  setCountryCode: (countryCode: string) => void;
  bindingPhoneCode: string;
  setBindingPhoneCode: (bindingPhoneCode: string) => void;
  sendingCode: boolean;
  sendBindingCode: () => Promise<void>;
  canBinding: boolean;
  clickedBinding: boolean;
  bindPhone: () => Promise<void>;
  cancelBindingPhone: () => void;
}

// 大陆用户绑定手机号
export function renderBindPhonePage({
  t,
  phone,
  setPhone,
  countdown,
  setCountryCode,
  bindingPhoneCode,
  setBindingPhoneCode,
  sendingCode,
  sendBindingCode,
  canBinding,
  clickedBinding,
  bindPhone,
  cancelBindingPhone,
}: RenderBindPhonePageProps): React.ReactNode {
  return (
    <div className="login-with-phone binding">
      <div className="login-width-limiter">
        <LoginTitle subtitle={t("need-bind-phone")} title={t("bind-phone")} />
        <Input
          placeholder={t("enter-phone")}
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
          placeholder={t("enter-code")}
          prefix={<img alt="checked" draggable={false} src={checkedSVG} />}
          status={!bindingPhoneCode || validateCode(bindingPhoneCode) ? undefined : "error"}
          suffix={
            countdown > 0 ? (
              <span className="login-countdown">
                {t("seconds-to-resend", { seconds: countdown })}
              </span>
            ) : (
              <Button
                disabled={sendingCode || !validatePhone(phone)}
                loading={sendingCode}
                size="small"
                type="link"
                onClick={sendBindingCode}
              >
                {t("send-verify-code")}
              </Button>
            )
          }
          value={bindingPhoneCode}
          onChange={ev => setBindingPhoneCode(ev.currentTarget.value)}
        />
        <Button
          className="login-big-button"
          disabled={!canBinding}
          loading={clickedBinding}
          type="primary"
          onClick={bindPhone}
        >
          {t("confirm")}
        </Button>
        <Button className="login-btn-back" type="link" onClick={cancelBindingPhone}>
          {t("back")}
        </Button>
      </div>
    </div>
  );
}

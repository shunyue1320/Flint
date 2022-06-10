import "./index.less";

import React from "react";
import { Checkbox } from "antd";

export interface LoginAgreementProps {
  checked: boolean;
  privacyURL?: string;
  serviceURL?: string;
  onChange: (checked: boolean) => void;
}

export const LoginAgreement: React.FC<LoginAgreementProps> = ({
  checked,
  privacyURL,
  serviceURL,
  onChange,
}) => {
  return (
    <div className="login-agreement">
      <Checkbox checked={checked} onChange={ev => onChange(ev.target.checked)}>
        已阅读并同意{" "}
        <a href={privacyURL} rel="noreferrer" target="_blank">
          隐私政策
        </a>{" "}
        和{" "}
        <a href={serviceURL} rel="noreferrer" target="_blank">
          服务协议
        </a>
      </Checkbox>
    </div>
  );
};

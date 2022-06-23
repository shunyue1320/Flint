import React from "react";
import { message } from "antd";
import { Meta, Story } from "@storybook/react";
import { LoginWithPhone, LoginWithPhoneProps } from ".";
import qrcodeSVG from "./icons/qrcode.svg";

const storyMeta: Meta = {
  title: "LoginPage/LoginWithPhone",
  component: LoginWithPhone,
};

export default storyMeta;

export const Overview: Story<LoginWithPhoneProps> = props => {
  return <LoginWithPhone {...props} />;
};

Overview.args = {
  onClickButton: provider => {
    message.info("点击了第三方登录" + provider);
  },
  sendVerificationCode: (country, phone) => {
    message.info("发送验证码" + country + " " + phone);
    return new Promise(resolve => setTimeout(() => resolve(phone === "123456")));
  },
  loginOrRegister: (country, phone, code) => {
    message.info("登录 " + country + " " + phone + " " + code);
    return new Promise(resolve => setTimeout(() => resolve(code === "123456"), 1000));
  },
  renderQRCode: () => <img alt="qrcode" src={qrcodeSVG} />,
};

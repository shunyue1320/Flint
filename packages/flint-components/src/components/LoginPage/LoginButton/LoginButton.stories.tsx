import { Meta, Story } from "@storybook/react";
import React from "react";
import { message } from "antd";
import { LoginButton, LoginButtonProps, LoginButtonProviderType } from ".";

const storyMeta: Meta = {
  title: "LoginPage/LoginButton",
  component: LoginButton,
};

export default storyMeta;

export const Overview: Story<LoginButtonProps> = ({ provider }) => {
  const handleLogin = (type: LoginButtonProviderType): void => {
    void message.info(type);
  };

  return <LoginButton provider={provider} onClick={handleLogin}></LoginButton>;
};

Overview.args = {
  provider: "wechat",
};

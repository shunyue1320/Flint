import React from "react";
import { Meta, Story } from "@storybook/react";

import { LoginPanel } from ".";

const storyMeta: Meta = {
  title: "LoginPage/LoginPanel",
  component: LoginPanel,
  parameters: {
    layout: "fullscreen",
    viewport: {
      viewports: {
        desktop: {
          name: "Desktop",
          styles: { width: "960px", height: "640px" },
        },
        web: {
          name: "Web",
          styles: { width: "1440px", height: "674px" },
        },
      },
      defaultViewport: "desktop",
    },
    options: {
      showPanel: false,
    },
  },
};

export default storyMeta;

export const PlayableExample: Story<{ region: "CN" | "US" }> = () => {
  return <LoginPanel></LoginPanel>;
};

PlayableExample.args = {
  region: "CN",
};

PlayableExample.argTypes = {
  region: {
    control: {
      type: "radio",
      options: ["CN", "US"],
    },
  },
};

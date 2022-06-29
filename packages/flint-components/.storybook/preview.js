import "tachyons/css/tachyons.min.css";

import { useEffect } from "react";
import { get } from "lodash-es";
import { addons } from "@storybook/addons";
import { useTranslation } from "react-i18next";
import { MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";

import { i18n } from "./i18next.js";
import { AntdProvider } from "../src/theme/antd.mod";
import { FlintThemeBodyProvider, useDarkMode } from "../src/components/FlintThemeProvider";

export const parameters = {
  options: {
    showPanel: true,
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    expanded: true,
    hideNoControlsWarning: true,
  },
  backgrounds: {
    values: [
      {
        name: "White",
        value: "#fff",
      },
      {
        name: "Homepage Background",
        value: "var(--grey-0)",
      },
      {
        name: "Homepage Dark Background",
        value: "var(--grey-12)",
      },
    ],
  },
  i18n,
  locale: "zh-CN",
  locales: {
    en: { title: "English", right: "🇺🇸" },
    "zh-CN": { title: "中文", right: "🇨🇳" },
  },
  viewport: {
    viewports: {
      ...MINIMAL_VIEWPORTS,
      flintDesktop: {
        name: "Flint Desktop",
        styles: { width: "960px", height: "640px" },
      },
    },
  },
};

export const decorators = [
  (Story, context) => {
    const { i18n } = useTranslation();
    console.log("i18n = ", i18n);
    return <AntdProvider lang={i18n.language}>{Story(context)}</AntdProvider>;
  },
  (Story, context) => {
    // const channel = addons.getChannel();
    const darkMode = useDarkMode(context.globals.prefersColorScheme);

    useEffect(() => {
      const bgColor = darkMode
        ? "var(--grey-12)"
        : get(context, ["parameters", "backgrounds", "default"], "#fff");

      document.querySelectorAll(".flat-theme-root").forEach(el => {
        el.style.backgroundColor = bgColor;
      });
    }, [darkMode]);

    return (
      <FlintThemeBodyProvider prefersColorScheme={context.globals.prefersColorScheme}>
        {Story(context)}
      </FlintThemeBodyProvider>
    );
  },
];

export const globalTypes = {
  prefersColorScheme: {
    name: "Prefers Color Scheme",
    description: "Prefers Color Scheme",
    defaultValue: "auto",
    toolbar: {
      icon: "paintbrush",
      items: ["auto", "light", "dark"],
    },
  },
};

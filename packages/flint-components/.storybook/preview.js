import "tachyons/css/tachyons.min.css";

import { addons } from "@storybook/addons";
import { useEffect } from "react";
import { get } from "lodash-es";

import { FlintThemeBodyProvider, useDarkMode } from "../src/components/FlintThemeProvider";
import { MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";

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

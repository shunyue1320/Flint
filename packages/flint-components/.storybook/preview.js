export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    controls: {
      expanded: true,
      hideNoControlsWarning: true,
    },
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

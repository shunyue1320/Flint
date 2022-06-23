const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  webpackFinal: config => {
    config.plugins.push(
      new ESLintPlugin({
        fix: true,
        extensions: ["ts", "tsx"],
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: path.resolve(__dirname, "..", "tsconfig.json"),
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
            declaration: true,
          },
        },
      }),
    );

    config.module.rules.unshift({
      test: /\.(sass|scss)(\?.*)?$/i,
      sideEffects: true,
      use: ["style-loader", "css-loader", "sass-loader"],
    });

    config.module.rules.unshift({
      test: /\.less$/,
      sideEffects: true,
      use: ["style-loader", "css-loader", "less-loader"],
    });

    return config;
  },
};

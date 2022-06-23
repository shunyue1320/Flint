import { addons } from "@storybook/addons";
import flatTheme from "./flat-theme";
// import "../src/theme/colors.less";
import "style-loader!css-loader!less-loader!../src/theme/colors.less";

document.body.classList.add("flat-colors-root");

addons.setConfig({
  theme: flatTheme,
});

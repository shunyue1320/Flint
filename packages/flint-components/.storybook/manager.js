import { addons } from "@storybook/addons";
import flintTheme from "./flint-theme";
import "style-loader!css-loader!less-loader!../src/theme/colors.less";

document.body.classList.add("flat-colors-root");

addons.setConfig({
  theme: flintTheme,
});

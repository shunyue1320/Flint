import "./style.less";

import { MainPageLayoutItem } from "../types";

export interface MainPageSubMenuProps {
  onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
  activeKeys: string[];
  subMenu: MainPageLayoutItem[];
}

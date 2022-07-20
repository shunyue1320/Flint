import "./style.less";

import { MainPageLayoutItem } from "./types";

export * from "./MainPageHeader";
export type { MainPageLayoutItem } from "./types";

export interface MainPageLayoutProps {
  /** when an item is clicked */
  onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
  /** a list of keys to highlight the items */
  activeKeys: string[];
}

import "./style.less";

import React from "react";

import { MainPageLayoutItem } from "../MainPageLayout/types";
import {
  MainPageNavHorizontal,
  MainPageNavHorizontalProps,
} from "../MainPageLayout/MainPageNavHorizontal";
import { MainPageSubMenuProps } from "../MainPageLayout/MainPageSubMenu";

export interface MainPageLayoutHorizontalProps
  extends MainPageNavHorizontalProps,
    Partial<Omit<MainPageSubMenuProps, "onClick" | "activeKeys">> {
  /** when an item is clicked */
  onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
  /** a list of keys to highlight the items */
  activeKeys: string[];
  children: React.ReactNode;
}

export const MainPageLayoutHorizontal: React.FC<MainPageLayoutHorizontalProps> = ({
  onClick,
  activeKeys,
  subMenu,
  children,
  ...restProps
}) => {
  return (
    <div className="main-horizontal-layout-container">
      <MainPageNavHorizontal {...restProps} activeKeys={activeKeys} onClick={onClick} />
      <div className="main-horizontal-layout-content-container fancy-scrollbar">
        {subMenu && <div>子菜单栏</div>}
        <div className="main-horizontal-layout-content">{children}</div>
      </div>
    </div>
  );
};

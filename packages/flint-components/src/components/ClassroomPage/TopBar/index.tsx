import "./style.less";

import React, { ReactNode } from "react";
import classNames from "classnames";

export * from "./TopBarRightBtn";

export const TopBarDivider: React.FC = () => {
  return <div className="topbar-divider"></div>;
};

export interface TopBarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  isMac?: boolean;
  topBarRef?: React.RefObject<HTMLDivElement>;
}

export const TopBar: React.FC<TopBarProps> = ({ left, center, right, isMac, topBarRef }) => (
  <div ref={topBarRef} className={classNames("topbar-box", { isMac, isWin: !isMac })}>
    <div className="topbar-content-left">{left}</div>
    <div className="topbar-content-center">{center}</div>
    <div className="topbar-content-right">{right}</div>
  </div>
);

export default TopBar;

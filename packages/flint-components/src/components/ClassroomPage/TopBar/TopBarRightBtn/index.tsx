import "./style.less";

import React from "react";
import classNames from "classnames";

export interface TopBarRightBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactElement;
}

export const TopBarRightBtn: React.FC<TopBarRightBtnProps> = ({
  title,
  icon,
  disabled,
  className,
  ...restProps
}) => (
  <button
    {...restProps}
    className={classNames("topbar-right-btn", className)}
    disabled={disabled}
    title={title}
  >
    {icon}
  </button>
);

import "./style.less";

import React, { useMemo } from "react";
import classNames from "classnames";

export interface ChatTabTitleProps {
  unreadCount?: number | null;
  children: React.ReactNode;
}

function isInteger(n: unknown): n is number {
  return Number.isSafeInteger(n);
}

export const ChatTabTitle: React.FC<ChatTabTitleProps> = ({ unreadCount, children }) => {
  const count = useMemo(
    () =>
      isInteger(unreadCount) && (
        <span
          className={classNames("chat-tab-red-dot", {
            "is-large": unreadCount > 99,
          })}
        >
          {unreadCount < 100 ? unreadCount : "99+"}
        </span>
      ),
    [unreadCount],
  );

  return (
    <span className="chat-tab-title">
      {children} {count}
    </span>
  );
};

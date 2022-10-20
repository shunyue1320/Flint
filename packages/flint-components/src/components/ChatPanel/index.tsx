import "./style.less";

import React, { useState, useMemo } from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flint-i18n";

import { SVGChat, SVGUserGroup } from "../FlatIcons";
import { ChatTabTitle, ChatTabTitleProps } from "./ChatTabTitle";
import { ChatMessages, ChatMessagesProps } from "./ChatMessages";
import { ChatUsers, ChatUsersProps } from "./ChatUsers";

export type ChatPanelProps = ChatTabTitleProps &
  Omit<ChatMessagesProps, "visible"> &
  ChatUsersProps;

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel(props) {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState<"messages" | "users">("messages");
  const usersCount = useMemo(() => {
    const count = props.users.length;
    if (count === 0) {
      return "";
    }
    if (count > 999) {
      return "(999+)";
    }
    return `(${count})`;
  }, [props.users.length]);
  return (
    <div className="chat-panel">
      <Tabs
        activeKey={activeTab}
        items={[
          // 消息列表
          {
            key: "messages",
            label: (
              <ChatTabTitle>
                <SVGChat />
                <span>{t("messages")}</span>
              </ChatTabTitle>
            ),
            children: <ChatMessages {...props} visible={activeTab === "messages"} />,
          },
          // 用户列表
          {
            key: "users",
            label: (
              <ChatTabTitle {...props}>
                <SVGUserGroup />
                <span>
                  {t("users")} {usersCount}
                </span>
              </ChatTabTitle>
            ),
            children: <ChatUsers {...props} />,
          },
        ]}
        tabBarGutter={0}
        onChange={setActiveTab as (key: string) => void}
      />
    </div>
  );
});

export { ChatMessage } from "./ChatMessage";
export * from "./types";

import "./style.less";

import React from "react";
import { useTranslation } from "react-i18next";

import { ChatTypeBox, ChatTypeBoxProps } from "../ChatTypeBox";
import { ChatMessageList, ChatMessageListProps } from "../ChatMessageList";

export type ChatMessagesProps = ChatTypeBoxProps & ChatMessageListProps;

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, ...restProps }) => {
  const { t } = useTranslation();

  return (
    <div className="chat-messages-wrap">
      <div className="chat-messages">
        {messages.length > 0 ? (
          <div className="chat-messages-box">
            <ChatMessageList messages={messages} {...restProps} />
          </div>
        ) : (
          <div className="chat-messages-default">{t("say-something")}</div>
        )}
      </div>
      {/* 聊天输入框 */}
      <ChatTypeBox {...restProps} />
    </div>
  );
};

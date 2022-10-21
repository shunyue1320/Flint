import "./style.less";
import chatMessagesDefaultSVG from "./icons/chat-messages-default.svg";
import chatMessagesDefaultDarkSVG from "./icons/chat-messages-default-dark.svg";

import React, { useContext } from "react";
import { observer } from "mobx-react-lite";

import { ChatTypeBox, ChatTypeBoxProps } from "../ChatTypeBox";
import { ChatMessageList, ChatMessageListProps } from "../ChatMessageList";
import { DarkModeContext } from "../../FlintThemeProvider";

export type ChatMessagesProps = ChatTypeBoxProps & ChatMessageListProps;

export const ChatMessages = observer<ChatMessagesProps>(function ChatMessages({
  messages,
  ...restProps
}) {
  const isDark = useContext(DarkModeContext);
  console.log("messages===", messages);
  return (
    <div className="chat-messages-wrap">
      <div className="chat-messages">
        {messages.length > 0 ? (
          <div className="chat-messages-box">
            <ChatMessageList messages={messages} {...restProps} />
          </div>
        ) : (
          <div className="chat-messages-default">
            <img src={isDark ? chatMessagesDefaultDarkSVG : chatMessagesDefaultSVG} />
          </div>
        )}
      </div>
      {/* 聊天输入框 */}
      <ChatTypeBox {...restProps} />
    </div>
  );
});

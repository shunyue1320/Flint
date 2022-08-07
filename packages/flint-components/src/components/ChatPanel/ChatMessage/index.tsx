import "./style.less";

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import { ChatMsg, ChatMsgType } from "../types";

export interface ChatMessageProps {
  userUUID: string;
  messageUser?: { name: string; avatar: string };
  message: ChatMsg;
  onMount: () => void;
  openCloudStorage?: () => void;
}

export const ChatMessage = observer<ChatMessageProps>(function ChatMessage({
  userUUID,
  messageUser,
  message,
  onMount,
  // 打开云存储
  openCloudStorage,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    onMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  switch (message.type) {
    // 根据消息类型返回对应样式
    case ChatMsgType.Notice:
      return (
        <div className="chat-message-line">
          <div className="chat-message-notice">{message.value}</div>
        </div>
      );
    case ChatMsgType.BanText: {
      return (
        <div className="chat-message-line">
          <div className="chat-message-ban">
            <span>{message.value ? t("banned") : t("unban")}</span>
          </div>
        </div>
      );
    }
    case ChatMsgType.UserGuide: {
      return (
        <div className="chat-message-line">
          <div className="chat-message-user-guide-bubble">
            <pre>
              {t("user-guide-text")}
              <span className="chat-message-user-guide-btn" onClick={openCloudStorage}>
                {t("user-guide-button")}
              </span>
            </pre>
          </div>
        </div>
      );
    }

    default: // not default
      break;
  }

  const time = new Date(message.timestamp);
  const fullTimeString = format(time, "yyyy-MM-dd HH:mm");
  const [dateString, timeString] = fullTimeString.split(" ");
  const dateToday = format(new Date(), "yyyy-MM-dd");
  // 是今天就只显示时间 不显示日期
  const finalTimeString = dateString === dateToday ? timeString : fullTimeString;

  // 是自己 消息在右边
  if (userUUID === message.userUUID) {
    return (
      <div className="chat-message-line is-reverse">
        <div className="chat-message-bubble is-self">
          <pre>{message.value}</pre>
        </div>
        <div className="chat-message-user">
          <time
            className="chat-message-user-time"
            dateTime={time.toISOString()}
            title={time.toLocaleString()}
          >
            {finalTimeString}
          </time>
          <span className="chat-message-user-name">{messageUser?.name || message.userUUID}</span>
          <span className="chat-message-user-avatar">
            <img alt="[avatar]" src={messageUser?.avatar} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-message-line">
      <div className="chat-message-bubble">
        <pre>{message.value}</pre>
      </div>
      <div className="chat-message-user">
        <span className="chat-message-user-avatar">
          <img alt="[avatar]" src={messageUser?.avatar} />
        </span>
        <span className="chat-message-user-name">{messageUser?.name || message.userUUID}</span>
        <time
          className="chat-message-user-time"
          dateTime={time.toISOString()}
          title={time.toLocaleString()}
        >
          {finalTimeString}
        </time>
      </div>
    </div>
  );
});
